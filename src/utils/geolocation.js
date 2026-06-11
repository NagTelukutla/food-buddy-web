/**
 * Resolves the device position using GPS when available.
 * Uses watchPosition briefly to improve accuracy instead of a single network fix.
 */
export function getAccuratePosition({ timeout = 15000, forceFresh = true } = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: forceFresh ? 0 : 60000,
      timeout,
    };

    let watchId = null;
    let bestPosition = null;
    let settled = false;

    const finish = (position, error) => {
      if (settled) return;
      settled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);

      if (position) {
        resolve(position);
        return;
      }

      reject(error || new Error('Unable to detect location'));
    };

    const timer = setTimeout(() => {
      finish(bestPosition, new Error('Location detection timed out'));
    }, timeout);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        if (position.coords.accuracy <= 80) {
          finish(position);
        }
      },
      (error) => {
        finish(bestPosition, error);
      },
      geoOptions
    );
  });
}
