import { CircleMember } from '../types';

export interface BirthdayInfo {
  member: CircleMember;
  daysRemaining: number; // 0 = today, 1 = tomorrow, 2..10
  formattedBirthday: string; // e.g. "18 Oct"
  isToday: boolean;
  age?: number;
}

/**
 * Calculates upcoming birthdays within maxDaysAhead (default: 10 days).
 * Correctly accounts for year rollovers (e.g. late December to early January).
 */
export function getUpcomingBirthdays(members: CircleMember[], maxDaysAhead = 10): BirthdayInfo[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  const results: BirthdayInfo[] = [];

  for (const member of members) {
    if (!member.dob) continue;
    const cleanDob = member.dob.trim();
    if (!cleanDob) continue;

    // Support YYYY-MM-DD or MM-DD
    const parts = cleanDob.split('-');
    if (parts.length < 2) continue;

    let birthMonth: number;
    let birthDay: number;
    let birthYear: number | undefined;

    if (parts.length === 3) {
      birthYear = parseInt(parts[0], 10);
      birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
      birthDay = parseInt(parts[2], 10);
    } else {
      birthMonth = parseInt(parts[0], 10) - 1;
      birthDay = parseInt(parts[1], 10);
    }

    if (isNaN(birthMonth) || isNaN(birthDay)) continue;

    // Calculate birthday occurrence this calendar year
    let targetBday = new Date(currentYear, birthMonth, birthDay);
    targetBday.setHours(0, 0, 0, 0);

    let diffTime = targetBday.getTime() - today.getTime();
    let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // If birthday already passed earlier this year, check next year
    if (diffDays < 0) {
      targetBday = new Date(currentYear + 1, birthMonth, birthDay);
      targetBday.setHours(0, 0, 0, 0);
      diffTime = targetBday.getTime() - today.getTime();
      diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    }

    if (diffDays >= 0 && diffDays <= maxDaysAhead) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const formattedBirthday = `${birthDay} ${monthNames[birthMonth]}`;
      const age = birthYear ? (targetBday.getFullYear() - birthYear) : undefined;

      results.push({
        member,
        daysRemaining: diffDays,
        formattedBirthday,
        isToday: diffDays === 0,
        age,
      });
    }
  }

  // Sort by days remaining ascending (today first, then tomorrow, etc.)
  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

/**
 * Checks if today is the birthday for a given DOB string (YYYY-MM-DD).
 */
export function isBirthdayToday(dob?: string): boolean {
  if (!dob) return false;
  const cleanDob = dob.trim();
  const parts = cleanDob.split('-');
  if (parts.length < 2) return false;

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-indexed
  const currentDay = today.getDate();

  let birthMonth: number;
  let birthDay: number;

  if (parts.length === 3) {
    birthMonth = parseInt(parts[1], 10);
    birthDay = parseInt(parts[2], 10);
  } else {
    birthMonth = parseInt(parts[0], 10);
    birthDay = parseInt(parts[1], 10);
  }

  return birthMonth === currentMonth && birthDay === currentDay;
}

/**
 * Formats DOB for display (e.g. "18 Oct 1998").
 */
export function formatDobDisplay(dob?: string): string {
  if (!dob) return '';
  const parts = dob.trim().split('-');
  if (parts.length < 2) return dob;

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(month) && month >= 0 && month < 12 && !isNaN(day)) {
      return `${day} ${monthNames[month]} ${year}`;
    }
  } else if (parts.length === 2) {
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    if (!isNaN(month) && month >= 0 && month < 12 && !isNaN(day)) {
      return `${day} ${monthNames[month]}`;
    }
  }
  return dob;
}
