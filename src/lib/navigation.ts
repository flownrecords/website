export const extractRoutePoints = (route: string): string[] => {
  return route
    .split(' ')
    .filter(token => /^[A-Z0-9]{2,5}$/.test(token) && token !== 'DCT');
};