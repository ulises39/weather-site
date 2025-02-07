export const ReservamosApiBaseUrl = 'https://search.reservamos.mx/api/v2/';

export const ReservamosApiEndpoints = {
  Places: 'places' as const,
};

export const getUrlWithParam = (param: string) => {
  return `${ReservamosApiBaseUrl}${ReservamosApiEndpoints.Places}?q=${param}`;
};
