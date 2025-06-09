"use client";
import { ProfileType } from "@/types/ScheduleType";
import ProfileImage from "@/app/components/common/ProfileImage";

interface ProfileContainerProps {
  profile?: ProfileType;
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className="flex items-center space-x-4 animate-pulse">
        <div className="w-28 h-28 bg-gray-200 rounded-lg" />
        <div>
          <div className="h-6 bg-gray-200 w-32 mb-2" />
          <div className="h-4 bg-gray-200 w-24 mb-1" />
          <div className="h-4 bg-gray-200 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-5">
      <ProfileImage userId={profile.id} size={64} />
      <div>
        <h2 className="text-2xl font-bold select-none">
          {profile.nickname || profile.name}
        </h2>
        <div className="text-gray-600 select-none mt-2">
          <p>
            <span className="font-semibold">소속:</span>{" "}
            {profile.department || "소속 미지정"}
          </p>

          <p>
            <span className="font-semibold">직급: </span>
            {profile.position || "직급 미지정"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileContainer;
