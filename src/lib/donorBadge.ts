/**
 * Trust layer: a donor is "verified" when they've completed enough
 * profile fields to be reliably contacted and matched.
 * (No SMS infra required — this is a profile-completeness signal.)
 */
export function isVerifiedDonor(profile: any): boolean {
  if (!profile || profile.role !== "donor") return false;
  return Boolean(
    profile.full_name &&
      profile.phone &&
      profile.blood_group &&
      profile.city &&
      (profile.last_donation_date || profile.donation_count > 0)
  );
}

export function donorBadgeReason(profile: any): string {
  const missing: string[] = [];
  if (!profile?.phone) missing.push("phone");
  if (!profile?.blood_group) missing.push("blood group");
  if (!profile?.city) missing.push("city");
  if (!profile?.last_donation_date && !profile?.donation_count) missing.push("donation history");
  return missing.length ? `Add ${missing.join(", ")} to get verified.` : "Verified donor";
}
