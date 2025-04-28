import React, { JSX } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export const Box = (): JSX.Element => {
  // Data for the login prompt
  const loginPrompt = {
    message: [
      "로그인하시면",
      "내가 좋아하는 작품과 작가를 팔로우하고",
      "더욱 쉽고 간편하게 작품을 감상할 수 있어요.",
    ],
    buttonText: "로그인하고 시작",
  };

  return (
    <div className="w-[526px] h-[272px]">
      <Card className="w-full h-full bg-[#ffc11a] rounded-[20px] relative">
        <CardContent className="p-0 h-full flex flex-col items-center justify-between">
          <div className="text-white text-center mt-[72px] [font-family:'Noto_Sans_KR',Helvetica] font-bold text-[14.7px] tracking-[0] leading-normal">
            {loginPrompt.message.map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < loginPrompt.message.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          <Button className="w-[267px] h-[68px] mb-[38px] bg-white rounded-[30px] text-black [font-family:'Noto_Sans_KR',Helvetica] font-bold text-[14.7px] tracking-[0] leading-normal hover:bg-white/90">
            {loginPrompt.buttonText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
