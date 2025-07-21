(window as any).global = window;

import MainBanner from "../components/MainBanner";
import ArtworkSlider from "../components/ArtworkSlider";
import BulletinBoard from "../components/BulletinBoard";

const HomePage = () => {
  return (
    <div className="bg-[#000000] text-[#e7ded9] min-h-screen p-6 space-y-10">
      <MainBanner />
      <ArtworkSlider />
      <BulletinBoard />
    </div>
  );
};

export default HomePage;
