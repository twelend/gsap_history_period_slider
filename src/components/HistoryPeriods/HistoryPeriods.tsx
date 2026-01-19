import React, { useCallback, useId, useRef, useState } from "react";
import { HistoryPeriodProps, TimePeriod } from "../../types/general-types";
import s from "./HistoryPeriods.module.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation } from "swiper/modules";
import gsap from "gsap";

import "swiper/css";
import "swiper/css/navigation";

const HistoryPeriods: React.FC<HistoryPeriodProps> = ({ periods, title }) => {
  const [activePeriodIndex, setActivePeriodIndex] = useState(0);
  const [displayedStartYear, setDisplayedStartYear] = useState(
    periods[0]?.startYear || 0
  );
  const [displayedEndYear, setDisplayedEndYear] = useState(
    periods[0]?.endYear || 0
  );

  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const circleInnerRef = useRef<HTMLDivElement>(null);
  const startYearRef = useRef<HTMLSpanElement>(null);
  const endYearRef = useRef<HTMLSpanElement>(null);
  const sliderWrapperRef = useRef<HTMLDivElement>(null);

  const activePeriod: TimePeriod = periods[activePeriodIndex];
  const totalPeriods = periods.length;

  const getPointPosition = useCallback(
    (id: number) => {
      const totalPoints = periods.length;
      const angleStep = 360 / totalPoints;
      const angle = -60 + angleStep * id; // -60 делает выбранную точку справа сверху
      const angleRad = (angle * Math.PI) / 180;
      const radius = 205; //  min-height: 410px; - у круга

      return {
        x: 205 + radius * Math.cos(angleRad),
        y: 205 + radius * Math.sin(angleRad),
        angle,
      };
    },
    [periods.length]
  );

  // Анимация смены периода
  const handlePeriodChange = useCallback(
    (newIndex: number) => {
      if (
        newIndex === activePeriodIndex ||
        newIndex < 0 ||
        newIndex >= totalPeriods
      )
        return;

      const newPeriod = periods[newIndex];
      const oldIndex = activePeriodIndex;

      const angleStep = 360 / totalPeriods;
      let rotationAngle = (newIndex - oldIndex) * angleStep;

      if (rotationAngle > 180) rotationAngle -= 360;
      if (rotationAngle < -180) rotationAngle += 360;

      const currentRotation =
        (gsap.getProperty(circleInnerRef.current, "rotation") as number) || 0;

      // Анимация поворота круга
      gsap.to(circleInnerRef.current, {
        rotation: currentRotation - rotationAngle,
        duration: 1,
        ease: "power2.inOut",
      });

      // Контр-поворот для точек (чтобы текст оставался горизонтальным)
      const points = circleInnerRef.current?.querySelectorAll(
        `.${s.circlePoint}`
      );
      points?.forEach((point) => {
        const currentPointRotation =
          (gsap.getProperty(point, "rotation") as number) || 0;
        gsap.to(point, {
          rotation: currentPointRotation + rotationAngle,
          duration: 1,
          ease: "power2.inOut",
        });
      });

      // countUp эффект
      const startYearObj = { value: displayedStartYear };
      const endYearObj = { value: displayedEndYear };

      gsap.to(startYearObj, {
        value: newPeriod.startYear,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          setDisplayedStartYear(Math.round(startYearObj.value));
        },
      });

      gsap.to(endYearObj, {
        value: newPeriod.endYear,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          setDisplayedEndYear(Math.round(endYearObj.value));
        },
      });

      if (sliderWrapperRef.current) {
        gsap.to(sliderWrapperRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            setActivePeriodIndex(newIndex);
            if (swiperInstance) {
              swiperInstance.slideTo(0);
            }
            gsap.to(sliderWrapperRef.current, {
              opacity: 1,
              duration: 0.3,
              delay: 0.2,
            });
          },
        });
      } else {
        setActivePeriodIndex(newIndex);
        if (swiperInstance) {
          swiperInstance.slideTo(0);
        }
      }
    },
    [
      activePeriodIndex,
      totalPeriods,
      periods,
      displayedStartYear,
      displayedEndYear,
      swiperInstance,
    ]
  );

  const handlePrevPeriod = () => {
    if (activePeriodIndex > 0) {
      handlePeriodChange(activePeriodIndex - 1);
    }
  };

  const handleNextPeriod = () => {
    if (activePeriodIndex < totalPeriods - 1) {
      handlePeriodChange(activePeriodIndex + 1);
    }
  };

  return (
    <div className={s.wrapper}>
      <div className={`${s.verticalLine} ${s.verticalLineLeft}`} />
      <div className={s.horizontalLine} />
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.headerAccent} />
          <h2 className={s.title}>{title}</h2>
        </header>

        <div className={s.mainContent}>
          <div className={s.circleWrapper}>
            <div className={s.circle} />
            <div ref={circleInnerRef} className={s.circleInner}>
              {periods.map((period, index) => {
                const position = getPointPosition(index);
                const isActive = index === activePeriodIndex;

                return (
                  <button
                    key={period.id}
                    className={`${s.circlePoint} ${
                      isActive ? s.circlePointActive : ""
                    }`}
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                    }}
                    onClick={() => handlePeriodChange(index)}
                    aria-label={`Перейти к периоду ${period.label}`}
                  >
                    <span className={s.pointNumber}>{index + 1}</span>
                    {isActive && (
                      <span className={s.pointLabel}>{period.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={s.datesDisplay}>
            <span
              ref={startYearRef}
              className={`${s.dateYear} ${s.dateYearStart}`}
            >
              {displayedStartYear}
            </span>
            <span ref={endYearRef} className={`${s.dateYear} ${s.dateYearEnd}`}>
              {displayedEndYear}
            </span>
          </div>

          <nav className={s.periodNavigation}>
            <div className={s.periodCounter}>
              {String(activePeriodIndex + 1).padStart(2, "0")}/
              {String(totalPeriods).padStart(2, "0")}
            </div>
            <div className={s.periodButtons}>
              <button
                className={s.periodButton}
                onClick={handlePrevPeriod}
                disabled={activePeriodIndex === 0}
                aria-label="Предыдущий период"
              >
                <svg viewBox="0 0 10 14">
                  <path d="M8.5 1L2 7l6.5 6" />
                </svg>
              </button>
              <button
                className={s.periodButton}
                onClick={handleNextPeriod}
                disabled={activePeriodIndex === totalPeriods - 1}
                aria-label="Следующий период"
              >
                <svg viewBox="0 0 10 14">
                  <path d="M1.5 1L8 7l-6.5 6" />
                </svg>
              </button>
            </div>
          </nav>
        </div>

        <section className={s.eventsSection}>
          <div ref={sliderWrapperRef} className={s.swiperWrapper}>
            <Swiper
              modules={[Navigation]}
              spaceBetween={0}
              slidesPerView="auto"
              onSwiper={setSwiperInstance}
              className={s.swiperContainer}
            >
              <div className={s.fadeLeft} />
              {activePeriod?.events.map((event, index) => (
                <SwiperSlide
                  key={`${activePeriod.id}-${event.year}-${index}`}
                  className={s.eventSlide}
                >
                  <div className={s.eventYear}>{event.year}</div>
                  <p className={s.eventDescription}>{event.description}</p>
                </SwiperSlide>
              ))}
              <div className={s.fadeRight} />
            </Swiper>
          </div>

          {/* Пагинация для мобилки*/}
          <div className={s.mobilePagination}>
            <nav className={`${s.periodNavigation} ${s.mobileArrows}`}>
              <div className={s.periodCounter}>
                {String(activePeriodIndex + 1).padStart(2, "0")}/
                {String(totalPeriods).padStart(2, "0")}
              </div>
              <div className={s.periodButtons}>
                <button
                  className={s.periodButton}
                  onClick={handlePrevPeriod}
                  disabled={activePeriodIndex === 0}
                  aria-label="Предыдущий период"
                >
                  <svg viewBox="0 0 10 14">
                    <path d="M8.5 1L2 7l6.5 6" />
                  </svg>
                </button>
                <button
                  className={s.periodButton}
                  onClick={handleNextPeriod}
                  disabled={activePeriodIndex === totalPeriods - 1}
                  aria-label="Следующий период"
                >
                  <svg viewBox="0 0 10 14">
                    <path d="M1.5 1L8 7l-6.5 6" />
                  </svg>
                </button>
              </div>
            </nav>
            {periods.map((_, index) => (
              <button
                key={index}
                className={`${s.paginationDot} ${
                  index === activePeriodIndex ? s.paginationDotActive : ""
                }`}
                onClick={() => handlePeriodChange(index)}
                aria-label={`Перейти к периоду ${index + 1}`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HistoryPeriods;
