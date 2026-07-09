export type CityId = "spb" | "msk";

export type CityOption = {
  id: CityId;
  /** Короткая подпись в шапке */
  label: string;
  /** Полное название в списке */
  name: string;
  /** Slug локации KudaGo API */
  kudagoLocation: string;
  available: boolean;
};

export const CITIES: CityOption[] = [
  {
    id: "spb",
    label: "СПб",
    name: "Санкт-Петербург",
    kudagoLocation: "spb",
    available: true,
  },
  {
    id: "msk",
    label: "Москва",
    name: "Москва",
    kudagoLocation: "msk",
    available: false,
  },
];

export const DEFAULT_CITY_ID: CityId = "spb";
export const CITY_STORAGE_KEY = "dvig_selected_city";

export function getCityById(id: string | null | undefined): CityOption {
  const found = CITIES.find((city) => city.id === id);
  if (found?.available) {
    return found;
  }
  return CITIES[0];
}
