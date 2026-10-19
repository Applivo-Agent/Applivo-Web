"use client";

import { motion } from "framer-motion";

// ── Authentic Job Platform & ATS Logos — Monochrome White Theme ──
const Platforms = [
  {
    name: "Internshala",
    icon: (
      <svg viewBox="0 0 48 48" className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] shrink-0 rounded-[6px]" aria-hidden="true">
        <rect width="48" height="48" rx="10" fill="#FFFFFF" />
        <g transform="translate(-138, -6) scale(2.05)">
          <path
            d="M91.1885 5.48222L96.1378 9.29731L96.1213 14.5188L100.143 11.873L104.007 14.6013L112.686 1L91.1885 5.48222ZM98.4609 10.5594L97.0513 12.9309L97.0575 8.93951L109.964 2.72504L98.4609 10.5594Z"
            fill="#0a0a0a"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M100.139 11.873L96.1172 14.5189L98.4599 10.5625L100.139 11.873Z"
            fill="#18181b"
          />
        </g>
        <text
          x="24"
          y="38"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="12"
          fontWeight="900"
          fill="#0a0a0a"
          textAnchor="middle"
          letterSpacing="-0.5"
        >
          IS
        </text>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[25px] h-[25px] sm:w-[27px] sm:h-[27px] shrink-0" fill="#FFFFFF" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.06 2.06 0 0 1-2.063-2.065a2.064 2.064 0 1 1 2.063 2.065m1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
      </svg>
    ),
  },
  {
    name: "Indeed",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[25px] h-[25px] sm:w-[27px] sm:h-[27px] shrink-0" fill="#FFFFFF" aria-hidden="true">
        <path d="M11.566 21.5633v-8.762c.2553.0231.5009.0346.758.0346 1.2225 0 2.3739-.3206 3.3506-.8928v9.6182c0 .8219-.1957 1.4287-.5757 1.8338-.378.4033-.8808.6049-1.491.6049-.6007 0-1.0766-.2016-1.468-.6183-.3781-.4032-.5739-1.01-.5739-1.8184zM11.589.5659c2.5447-.8929 5.4424-.8449 7.6186.987.405.3687.8673.8334 1.0515 1.3806.2207.6913-.7695-.073-.9057-.167-.71-.4532-1.4182-.8334-2.2127-1.0946C12.8614.3873 8.8122 2.709 6.2945 6.315c-1.0516 1.5939-1.7367 3.2721-2.299 5.1174-.0614.2017-.1094.4647-.2207.6413-.1113.2036-.048-.5453-.048-.5702.0845-.7623.2438-1.4997.4414-2.237C5.3292 5.3375 7.897 2.0655 11.5891.5658zm4.9281 7.0587c0 1.6686-1.353 3.0224-3.0205 3.0224-1.6677 0-3.0186-1.3538-3.0186-3.0224 0-1.6687 1.351-3.0224 3.0186-3.0224 1.6676 0 3.0205 1.3518 3.0205 3.0224Z" />
      </svg>
    ),
  },
  {
    name: "Glassdoor",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[25px] h-[25px] sm:w-[27px] sm:h-[27px] shrink-0" fill="#FFFFFF" aria-hidden="true">
        <path d="M14.1093.0006c-.0749-.0074-.1348.0522-.1348.127v3.451c0 .0673.0537.1194.121.127 2.619.172 4.6092.9501 4.6092 3.6814H13.086a.1343.1343 0 0 0-.1348.1347v8.9644c0 .0748.06.1347.1348.1347h10.0034c.0748 0 .1347-.0599.1347-.1347V7.342c0-2.2374-.7996-4.0558-2.4159-5.3279C19.3191.8469 17.0874.1428 14.1093.0006ZM.9107 7.387a.1342.1342 0 0 0-.1347.1347v8.9566c0 .0748.06.1347.1347.1347h5.6189c0 2.7313-1.9902 3.5094-4.6091 3.6815-.0674.0075-.1192.0596-.1192.127v3.451c0 .0747.06.1343.1348.1269 2.9781-.1422 5.2078-.8463 6.6969-2.0136 1.6163-1.272 2.4159-3.0905 2.4159-5.3278V7.5217a.1343.1343 0 0 0-.1348-.1347z" />
      </svg>
    ),
  },
  {
    name: "Greenhouse",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[25px] h-[25px] sm:w-[27px] sm:h-[27px] shrink-0" fill="#FFFFFF" aria-hidden="true">
        <path d="M16.279 7.13c0 1.16-.49 2.185-1.293 2.987c-.891.891-2.184 1.114-2.184 1.872c0 1.025 1.65.713 3.231 2.295c1.048 1.047 1.694 2.43 1.694 4.034C17.727 21.482 15.187 24 12 24s-5.727-2.518-5.727-5.68c0-1.607.646-2.989 1.694-4.036c1.582-1.582 3.23-1.27 3.23-2.295c0-.758-1.292-.98-2.183-1.872c-.802-.802-1.293-1.827-1.293-3.03c0-2.318 1.895-4.19 4.212-4.19c.446 0 .847.067 1.181.067c.602 0 .914-.268.914-.691c0-.245-.112-.557-.112-.891c0-.758.647-1.382 1.427-1.382s1.404.646 1.404 1.426c0 .825-.647 1.204-1.137 1.382c-.401.134-.713.312-.713.713c0 .758 1.382 1.493 1.382 3.61zm-.446 11.19c0-2.206-1.627-3.99-3.833-3.99s-3.833 1.784-3.833 3.99c0 2.184 1.627 3.989 3.833 3.989s3.833-1.808 3.833-3.99zM14.518 7.086c0-1.404-1.136-2.562-2.518-2.562S9.482 5.682 9.482 7.086S10.618 9.65 12 9.65s2.518-1.159 2.518-2.563z" />
      </svg>
    ),
  },
  {
    name: "Lever",
    icon: (
      <svg viewBox="0 0 64 64" className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] shrink-0" aria-hidden="true">
        <g transform="matrix(2.129589,0,0,2.129589,-19.365391,-31.88767)">
          <path
            d="m 38.863613,43.444159 -5.657458,-5.658397 a 0.95583246,0.95583246 0 0 0 -1.338293,0 l -5.657459,5.658397 a 0.91786563,0.91786563 0 0 0 0.668677,1.581534 h 11.315856 a 0.9226741,0.9226741 0 0 0 0.668677,-1.581534 z"
            fill="#FFFFFF"
            fillOpacity="0.75"
          />
          <path
            d="M 39.051882,23.120886 37.2797,17.85975 A 1.8518346,1.8518346 0 0 0 36.904978,17.215491 L 9.3089036,44.810627 a 0.84551954,0.84551954 0 0 0 0.5907273,0.215066 h 7.8381711 a 1.6649181,1.6649181 0 0 0 1.181455,-0.483664 L 38.676221,24.785065 a 1.5855597,1.5855597 0 0 0 0.375661,-1.664179 z"
            fill="#FFFFFF"
          />
          <path
            d="m 36.260218,16.83886 -5.261136,-1.771243 a 1.5855597,1.5855597 0 0 0 -1.664179,0.375661 L 9.5770005,35.200211 a 1.6718929,1.6718929 0 0 0 -0.4827247,1.181454 v 7.838172 a 0.84551954,0.84551954 0 0 0 0.215066,0.590727 L 36.905416,17.215491 A 1.8616707,1.8616707 0 0 0 36.260218,16.83886 Z"
            fill="#FFFFFF"
            fillOpacity="0.88"
          />
        </g>
      </svg>
    ),
  },
  {
    name: "Workday",
    icon: (
      <svg viewBox="0 0 64 64" className="w-[27px] h-[27px] sm:w-[29px] sm:h-[29px] shrink-0" fill="none" aria-hidden="true">
        <g transform="matrix(0.53333333,0,0,0.53333333,-124.63685,-16)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m 251.21,88.7755 h 8.224 c 1.166,0 2.178,0.7836 2.444,1.8924 l 11.057,44.6751 c 0.152,0.002 12.182,-44.6393 12.182,-44.6393 0.306,-1.1361 1.36,-1.9282 2.566,-1.9282 h 12.74 c 1.144,0 2.144,0.7515 2.435,1.8296 l 12.118,44.9289 c 0.448,-0.282 11.147,-44.8661 11.147,-44.8661 0.267,-1.1088 1.279,-1.8924 2.444,-1.8924 h 8.219 c 1.649,0 2.854,1.5192 2.437,3.0742 l -15.08,56.3173 c -0.286,1.072 -1.272,1.823 -2.406,1.833 l -12.438,-0.019 c -1.142,-0.002 -2.137,-0.744 -2.429,-1.819 -2.126,-7.805 -12.605,-47.277 -12.605,-47.277 0,0 -11.008,39.471 -13.133,47.277 -0.293,1.075 -1.288,1.817 -2.429,1.819 L 266.264,150 c -1.133,-0.01 -2.119,-0.761 -2.406,-1.833 L 248.777,91.8438 c -0.416,-1.5524 0.786,-3.0683 2.433,-3.0683 z"
            fill="#FFFFFF"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m 333.324,72.2449 c 0.531,0 1.071,-0.0723 1.608,-0.2234 3.18,-0.8968 5.039,-4.2303 4.153,-7.446 -0.129,-0.4673 -0.265,-0.9327 -0.408,-1.3936 C 332.529,43.3349 314.569,30 293.987,30 c -20.557,0 -38.51,13.3133 -44.673,33.1281 -0.136,0.4355 -0.267,0.8782 -0.391,1.3232 -0.902,3.2119 0.943,6.5541 4.12,7.4645 3.173,0.9112 6.48,-0.9547 7.381,-4.1666 0.094,-0.3322 0.19,-0.6616 0.292,-0.9892 4.591,-14.7582 17.961,-24.6707 33.271,-24.6707 15.329,0 28.704,9.9284 33.281,24.7063 0.105,0.3397 0.206,0.682 0.301,1.0263 0.737,2.6726 3.139,4.423 5.755,4.423 z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    ),
  },
  {
    name: "Wellfound",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[25px] h-[25px] sm:w-[27px] sm:h-[27px] shrink-0" fill="#FFFFFF" aria-hidden="true">
        <path d="M23.998 8.128c.063-1.379-1.612-2.376-2.795-1.664-1.23.598-1.322 2.52-.156 3.234 1.2.862 2.995-.09 2.951-1.57zm0 7.748c.063-1.38-1.612-2.377-2.795-1.665-1.23.598-1.322 2.52-.156 3.234 1.2.863 2.995-.09 2.951-1.57zm-20.5 1.762L0 6.364h3.257l2.066 8.106 2.245-8.106h3.267l2.244 8.106 2.065-8.106h3.257l-3.54 11.274H11.39c-.73-2.713-1.46-5.426-2.188-8.14l-2.233 8.14H3.5z" />
      </svg>
    ),
  },
];

export function MiddleHero() {
  return (
    <section className="bg-[#0a0a0a] pt-12 sm:pt-16 pb-16 sm:pb-20 md:pb-24 relative overflow-hidden flex flex-col items-center z-10 border-t border-white/[0.04]">
      {/* ── Centered header text ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8 sm:mb-10 z-20 px-6 max-w-2xl"
      >
        <p className="text-white text-base sm:text-lg md:text-[20px] font-semibold tracking-[-0.015em] mb-1.5">
          Powering ambitious job seekers worldwide.
        </p>
        <p className="text-zinc-400 text-xs sm:text-sm md:text-[14.5px] leading-relaxed">
          From fresh graduates to senior executives — all in one intelligent platform.
        </p>
      </motion.div>

      {/* ── Seamless continuous logo marquee ── */}
      <div
        className="w-full relative flex items-center z-20 overflow-hidden marquee-container py-3"
      >
        <div className="flex w-fit animate-marquee items-center select-none cursor-default">
          {/* Track 1 */}
          <div className="flex shrink-0 items-center gap-12 sm:gap-16 md:gap-20 pr-12 sm:pr-16 md:pr-20">
            {Platforms.map((platform) => (
              <div
                key={`track-1-${platform.name}`}
                className="group flex items-center gap-3 sm:gap-3.5 shrink-0 transition-transform duration-200 hover:scale-[1.03]"
              >
                <span className="flex-shrink-0 transition-opacity group-hover:opacity-100 opacity-80">
                  {platform.icon}
                </span>
                <span className="text-zinc-200 group-hover:text-white font-semibold text-[17px] sm:text-[19px] md:text-[20px] tracking-tight transition-colors">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>

          {/* Track 2 (Identical duplicate for mathematically seamless loop) */}
          <div className="flex shrink-0 items-center gap-12 sm:gap-16 md:gap-20 pr-12 sm:pr-16 md:pr-20" aria-hidden="true">
            {Platforms.map((platform) => (
              <div
                key={`track-2-${platform.name}`}
                className="group flex items-center gap-3 sm:gap-3.5 shrink-0 transition-transform duration-200 hover:scale-[1.03]"
              >
                <span className="flex-shrink-0 transition-opacity group-hover:opacity-100 opacity-80">
                  {platform.icon}
                </span>
                <span className="text-zinc-200 group-hover:text-white font-semibold text-[17px] sm:text-[19px] md:text-[20px] tracking-tight transition-colors">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
