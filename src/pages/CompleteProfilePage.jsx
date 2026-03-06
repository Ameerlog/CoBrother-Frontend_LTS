import ProfileCompletionModal from '../components/profile/ProfileCompletionModal';

export default function CompleteProfilePage() {
  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb-1" />
        <div className="auth-bg-orb orb-2" />
        <div className="auth-bg-grid" />
      </div>
      <ProfileCompletionModal forceOpen />
    </div>
  );
}
