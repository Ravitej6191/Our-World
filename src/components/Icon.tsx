import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  const sw = strokeWidth;
  const p = (d: string, extra: React.SVGProps<SVGPathElement> = {}) => (
    <path d={d} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" {...extra} />
  );
  const c = (cx: number, cy: number, r: number, extra: React.SVGProps<SVGCircleElement> = {}) => (
    <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={sw} fill="none" {...extra} />
  );

  const icons: Record<string, React.ReactNode> = {
    plus:        <>{p('M12 5v14')}{p('M5 12h14')}</>,
    camera:      <>{p('M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z')}{c(12,13,3.5)}</>,
    mic:         <>{p('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z')}{p('M5 11a7 7 0 0 0 14 0')}{p('M12 18v3')}</>,
    video:       <>{p('M3 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z')}{p('M16 10l5-3v10l-5-3')}</>,
    text:        <>{p('M6 5h12')}{p('M12 5v14')}</>,
    heart:       <>{p('M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z')}</>,
    star:        <>{p('M12 3l2.6 5.4 5.9.9-4.3 4.1 1 5.9L12 16.8 6.8 19.3l1-5.9L3.5 9.3l5.9-.9L12 3z')}</>,
    share:       <>{c(6,12,2.5)}{c(17,6,2.5)}{c(17,18,2.5)}{p('M8.2 10.8l6.6-3.6')}{p('M8.2 13.2l6.6 3.6')}</>,
    sparkle:     <>{p('M12 4l1.4 4.6L18 10l-4.6 1.4L12 16l-1.4-4.6L6 10l4.6-1.4z')}{p('M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z')}</>,
    back:        <>{p('M15 6l-6 6 6 6')}</>,
    close:       <>{p('M6 6l12 12')}{p('M18 6L6 18')}</>,
    check:       <>{p('M5 12.5L10 17l9-10')}</>,
    search:      <>{c(11,11,6)}{p('M20 20l-4.3-4.3')}</>,
    more:        <>{c(5,12,1,{fill:color,stroke:'none'})}{c(12,12,1,{fill:color,stroke:'none'})}{c(19,12,1,{fill:color,stroke:'none'})}</>,
    play:        <>{p('M8 5v14l11-7z', {fill:color,stroke:'none'})}</>,
    timeline:    <>{c(6,6,2)}{c(6,18,2)}{p('M6 8v8')}{p('M11 6h9')}{p('M11 18h9')}</>,
    user:        <>{c(12,8,3.5)}{p('M5 20c1.5-4 5-5 7-5s5.5 1 7 5')}</>,
    bell:        <>{p('M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z')}{p('M10 20a2 2 0 0 0 4 0')}</>,
    lock:        <>{p('M7 11V8a5 5 0 0 1 10 0v3')}{p('M5 11h14v9H5z')}</>,
    globe:       <>{c(12,12,8)}{p('M4 12h16')}{p('M12 4a12 12 0 0 1 0 16a12 12 0 0 1 0-16')}</>,
    trash:       <>{p('M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13')}</>,
    edit:        <>{p('M4 20l4-1 11-11-3-3L5 16l-1 4z')}</>,
    chevron:     <>{p('M9 6l6 6-6 6')}</>,
    chevrondown: <>{p('M6 9l6 6 6-6')}</>,
    calendar:    <>{p('M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z')}{p('M4 10h16M8 3v4M16 3v4')}</>,
    download:    <>{p('M12 4v12m0 0l-4-4m4 4l4-4')}{p('M4 20h16')}</>,
    filter:      <>{p('M4 5h16l-6 8v6l-4-2v-4z')}</>,
    location:    <>{p('M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z')}{c(12,10,2.5)}</>,
    mail:        <>{p('M4 6h16v12H4z')}{p('M4 7l8 6 8-6')}</>,
    message:     <>{p('M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6z')}</>,
    link:        <>{p('M10 14a4 4 0 0 1 0-5.7l2-2a4 4 0 0 1 5.7 5.7l-1.5 1.5')}{p('M14 10a4 4 0 0 1 0 5.7l-2 2a4 4 0 0 1-5.7-5.7l1.5-1.5')}</>,
    info:        <>{c(12,12,8)}{p('M12 11v5M12 8v.01')}</>,
    help:        <>{c(12,12,8)}{p('M9 9a3 3 0 0 1 6 0c0 1.5-2 2-3 3v1M12 17v.01')}</>,
    shield:      <>{p('M12 3l8 3v6a9 9 0 0 1-8 9 9 9 0 0 1-8-9V6z')}</>,
    cloud:       <>{p('M7 18a4 4 0 1 1 1-7.9A5 5 0 0 1 18 11a3.5 3.5 0 0 1 0 7H7z')}</>,
    users:       <>{c(9,8,3)}{p('M3 20c1-3 3-4 6-4s5 1 6 4')}{c(17,7,2.5)}{p('M15 13c2 0 4 1 5 3')}</>,
    refresh:     <>{p('M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a6 6 0 1 0 2 5')}</>,
    sun:         <>{c(12,12,4)}{p('M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4')}</>,
    logout:      <>{p('M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5')}{p('M14 8l4 4-4 4M10 12h8')}</>,
    pause:       <>{p('M8 5v14M16 5v14')}</>,
    eye:         <>{p('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z')}{c(12,12,3)}</>,
    settings:    <>{c(12,12,3)}{p('M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4')}</>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] ?? icons.plus}
    </svg>
  );
}
