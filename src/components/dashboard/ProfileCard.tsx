export type InvestorProfile = {
  displayName: string
  email: string
  membershipTier: string
  preferredContact: string
  notes: string
}

const mockProfile: InvestorProfile = {
  displayName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  membershipTier: 'Preferred investor',
  preferredContact: 'Email',
  notes: 'Interested in multifamily and industrial deals in the Southeast.',
}

type ProfileCardProps = {
  profile?: InvestorProfile
}

export function ProfileCard({ profile = mockProfile }: ProfileCardProps) {
  return (
    <section className="dashboard-panel profile-card" aria-label="Investor profile">
      <h2>Your profile</h2>
      <dl>
        <div>
          <dt>Name</dt>
          <dd>{profile.displayName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>Membership</dt>
          <dd>{profile.membershipTier}</dd>
        </div>
        <div>
          <dt>Preferred contact</dt>
          <dd>{profile.preferredContact}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{profile.notes}</dd>
        </div>
      </dl>
    </section>
  )
}
