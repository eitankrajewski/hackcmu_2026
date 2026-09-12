import { INTERESTS, type GeoPoint, type Hangout, type Interest, type MatchReport, type Person, type Place, type WeeklyHours } from './types';

export function milesBetween(a: GeoPoint, b: GeoPoint): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return (2 * 3958.8 * Math.asin(Math.min(1, Math.sqrt(h))));
}

export function centroid(points: GeoPoint[]): GeoPoint | undefined {
  if (!points.length) return undefined;
  return {
    latitude: points.reduce((s, p) => s + p.latitude, 0) / points.length,
    longitude: points.reduce((s, p) => s + p.longitude, 0) / points.length,
  };
}

export function everydayHours(open: number, close: number): WeeklyHours {
  return {
    days: Array.from({ length: 7 }, () => ({ openMinutes: open, closeMinutes: close, closed: false })),
  };
}

export function closedMondays(open: number, close: number): WeeklyHours {
  return {
    days: Array.from({ length: 7 }, (_, i) => ({
      openMinutes: open,
      closeMinutes: close,
      closed: i === 1,
    })),
  };
}

export function isOpen(place: Place, at = new Date()): boolean {
  if (place.openNowOverride != null) return place.openNowOverride;
  if (!place.hours) return true;
  const weekday = at.getDay();
  const day = place.hours.days[weekday];
  if (!day || day.closed) return false;
  const minutes = at.getHours() * 60 + at.getMinutes();
  if (day.closeMinutes > day.openMinutes) {
    return minutes >= day.openMinutes && minutes < day.closeMinutes;
  }
  return minutes >= day.openMinutes || minutes < day.closeMinutes;
}

export function hoursSummary(hours?: WeeklyHours): string {
  const sample = hours?.days.find((d) => !d.closed);
  if (!sample) return 'Hours unknown';
  const stamp = (m: number) => {
    const h = Math.floor(m / 60) % 24;
    const min = m % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${min.toString().padStart(2, '0')} ${ampm}`;
  };
  return `${stamp(sample.openMinutes)}–${stamp(sample.closeMinutes)}`;
}

export function priceLabel(level: number) {
  return '$'.repeat(Math.max(1, Math.min(4, level)));
}

export function sharedInterests(people: Person[]): Interest[] {
  if (!people.length) return [];
  const sets = people.map((p) => new Set(p.interests));
  return INTERESTS.map((i) => i.id).filter((id) => sets.every((s) => s.has(id)));
}

export function sharedBudget(people: Person[]): { min: number; max: number } | undefined {
  if (!people.length) return undefined;
  let min = Math.max(...people.map((p) => p.budgetMin));
  let max = Math.min(...people.map((p) => p.budgetMax));
  return min <= max ? { min, max } : undefined;
}

export function meetingPoint(people: Person[]) {
  return centroid(people.map((p) => p.home));
}

export function hoursOverlap(startA: number, endA: number, startB: number, endB: number) {
  const aEnd = endA === startA ? startA + 1 : endA;
  const bEnd = endB === startB ? startB + 1 : endB;
  return Math.max(startA, startB) < Math.min(aEnd, bEnd);
}

export function sortedStops(hangout: Hangout) {
  return [...hangout.stops].sort((a, b) => a.order - b.order);
}

export function matchReport(hangout: Hangout, members: Person[]): MatchReport {
  const interests = sharedInterests(members);
  const budget = sharedBudget(members);
  const meet = meetingPoint(members);

  let interestScore = 0.4;
  if (!hangout.interests.length) {
    interestScore = interests.length ? 0.7 : 0.4;
  } else {
    const overlap = hangout.interests.filter((i) => interests.includes(i));
    if (overlap.length) {
      interestScore = overlap.length / hangout.interests.length;
    } else {
      const union = new Set(members.flatMap((m) => m.interests));
      const soft = hangout.interests.filter((i) => union.has(i));
      interestScore = Math.min(0.55, soft.length / hangout.interests.length);
    }
  }

  let budgetScore = 0.15;
  if (budget) {
    if (hangout.budgetPerPerson === 0) budgetScore = 1;
    else if (hangout.budgetPerPerson >= budget.min && hangout.budgetPerPerson <= budget.max) budgetScore = 1;
    else if (hangout.budgetPerPerson < budget.min) budgetScore = 0.85;
    else budgetScore = Math.max(0, 1 - (hangout.budgetPerPerson - budget.max) / 60);
  }

  const startHour = new Date(hangout.start).getHours();
  const endHour = new Date(hangout.end).getHours();
  const hits = members.filter((p) =>
    hoursOverlap(p.typicalStartHour, p.typicalEndHour, startHour, Math.max(endHour, startHour + 1)),
  );
  const timelineScore = members.length ? hits.length / members.length : 0;

  const stops = sortedStops(hangout);
  const anchors: GeoPoint[] =
    stops.length ? stops.map((s) => s.place.coordinate) : meet ? [meet] : [];
  const tooFarNames: string[] = [];
  let distanceScore = 0.5;
  if (members.length && anchors.length) {
    const scores = members.map((person) => {
      const nearest = Math.min(...anchors.map((a) => milesBetween(person.home, a)));
      const cap = Math.min(person.maxTravelMiles, hangout.maxDistanceMiles);
      if (nearest > cap) {
        tooFarNames.push(person.name);
        return Math.max(0, 1 - (nearest - cap) / Math.max(cap, 1));
      }
      return 1 - Math.min(1, nearest / Math.max(cap, 1)) * 0.35;
    });
    distanceScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  } else if (!anchors.length) {
    distanceScore = 0.5;
  } else {
    distanceScore = 0;
  }

  const overall = Math.min(
    1,
    Math.max(
      0,
      interestScore * 0.3 + budgetScore * 0.25 + timelineScore * 0.2 + distanceScore * 0.25,
    ),
  );

  const notes: string[] = [];
  if (budget) notes.push(`Shared budget $${budget.min}–$${budget.max}/person`);
  else notes.push('No overlapping budget — someone will be stretched');
  if (!interests.length) notes.push('No fully shared interests — mix the itinerary');
  else notes.push(`Shared vibe: ${interests.map((i) => INTERESTS.find((row) => row.id === i)?.label ?? i).join(', ')}`);
  if (tooFarNames.length) notes.push(`Long commute: ${tooFarNames.join(', ')}`);

  return {
    interest: interestScore,
    budget: budgetScore,
    timeline: timelineScore,
    distance: distanceScore,
    overall,
    sharedInterests: interests,
    sharedBudget: budget,
    meetingPoint: meet,
    tooFarNames,
    notes,
  };
}
