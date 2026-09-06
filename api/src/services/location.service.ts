import { prisma } from '../config/prisma.js';
import { haversineKm } from '../utils/geo.js';
import { AppError } from '../utils/AppError.js';

const latestMap = (rows: any[]) => {
  const map = new Map<string, any>();
  for (const row of rows) {
    if (!map.has(row.locationId)) map.set(row.locationId, row);
  }
  return map;
};

export const locationService = {
  async search(q: any) {
    const where: any = { active: true };

    if (q.city) where.city = { equals: q.city };
    if (q.category) where.category = { slug: q.category };
    if (q.query) {
      where.OR = [
        { name: { contains: q.query } },
        { address: { contains: q.query } },
        { business: { name: { contains: q.query } } },
      ];
    }

    const skip = (q.page - 1) * q.limit;
    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        include: {
          business: true,
          category: true,
          snapshots: { orderBy: { recordedAt: 'desc' }, take: 1 },
        },
        skip,
        take: q.limit,
      }),
      prisma.location.count({ where }),
    ]);

    const items = locations
      .map((location) => ({
        ...location,
        current: location.snapshots[0] ?? null,
      }))
      .filter(
        (location: any) =>
          q.maxWaitTime == null ||
          (location.current?.estimatedWaitTime ?? 0) <= q.maxWaitTime,
      )
      .filter(
        (location: any) =>
          !q.crowdLevel || location.current?.crowdLevel === q.crowdLevel,
      );

    return { items, total, page: q.page, limit: q.limit };
  },

  async nearby(q: any) {
    if (q.latitude == null || q.longitude == null) {
      throw new AppError(
        400,
        'COORDINATES_REQUIRED',
        'latitude and longitude are required',
      );
    }

    const locations = await prisma.location.findMany({
      where: { active: true },
      include: { business: true, category: true },
    });

    const snapshots = await prisma.queueSnapshot.findMany({
      where: { locationId: { in: locations.map((location) => location.id) } },
      orderBy: { recordedAt: 'desc' },
    });

    const snapshotMap = latestMap(snapshots);
    const items = locations
      .map((location) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        city: location.city,
        business: location.business,
        category: location.category,
        distance: Number(
          haversineKm(
            q.latitude,
            q.longitude,
            Number(location.latitude),
            Number(location.longitude),
          ).toFixed(2),
        ),
        current: snapshotMap.get(location.id) ?? null,
      }))
      .filter((location) => location.distance <= q.radius);

    items.sort((a, b) =>
      q.sort === 'wait_time'
        ? (a.current?.estimatedWaitTime ?? 999) -
          (b.current?.estimatedWaitTime ?? 999)
        : a.distance - b.distance,
    );

    return items.slice(0, q.limit ?? 20);
  },
};
