import { useEffect, useState } from "react";

const TimeCard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDay = currentTime.getHours() >= 6 && currentTime.getHours() < 18;

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  

  return (
    <div className="bg-[#e2e8f0] shadow-md rounded-xl px-4 py-2 flex items-center space-x-3 min-h-[65px]">
      <div className="text-3xl leading-none flex items-center animate-bounce">
        {isDay ? "🌞" : "🌙"}
      </div>
      <div className="leading-tight">
        <div className="text-xs text-[#a9a9a9]">Now</div>
        <div className="font-bold text-sm text-[#013f6e]">{formatDate(currentTime)}</div>
        <div className="text-[#013f6e] text-sm">{formatTime(currentTime)}</div>
      </div>
    </div>
  );
};

export default TimeCard;
