"use client";

import { useCallback, useEffect, useState } from "react";

import {
  CITIES,
  CITY_STORAGE_KEY,
  DEFAULT_CITY_ID,
  getCityById,
  type CityId,
  type CityOption,
} from "@/lib/cities";

function readStoredCityId(): CityId {
  if (typeof window === "undefined") {
    return DEFAULT_CITY_ID;
  }
  return getCityById(localStorage.getItem(CITY_STORAGE_KEY)).id;
}

export function useSelectedCity() {
  const [cityId, setCityIdState] = useState<CityId>(DEFAULT_CITY_ID);

  useEffect(() => {
    setCityIdState(readStoredCityId());

    const sync = () => setCityIdState(readStoredCityId());
    window.addEventListener("storage", sync);
    window.addEventListener("dvig:city-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("dvig:city-change", sync);
    };
  }, []);

  const setCityId = useCallback((id: CityId) => {
    const next = CITIES.find((city) => city.id === id);
    if (!next?.available) {
      return;
    }
    localStorage.setItem(CITY_STORAGE_KEY, id);
    setCityIdState(id);
    window.dispatchEvent(new Event("dvig:city-change"));
  }, []);

  const city: CityOption = getCityById(cityId);

  return { cityId, city, setCityId, cities: CITIES };
}
