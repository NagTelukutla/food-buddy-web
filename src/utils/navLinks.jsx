import { canUseCartFeatures } from './roles';

const locationIcon = (
  <svg className="h-4 w-4" viewBox="0 0 682.667 682.667" fill="none" aria-hidden>
    <defs>
      <clipPath id="nav-location-icon-clip" clipPathUnits="userSpaceOnUse">
        <path d="M0 512h512V0H0Z" />
      </clipPath>
    </defs>
    <g clipPath="url(#nav-location-icon-clip)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
      <path
        d="M0 0c-60 90-165 212-165 317 0 90.981 74.019 165 165 165s165-74.019 165-165C165 212 60 90 0 0Z"
        transform="translate(256 15)"
        fill="none"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
      />
      <path
        d="M0 0c-41.353 0-75 33.647-75 75s33.647 75 75 75 75-33.647 75-75S41.353 0 0 0Z"
        transform="translate(256 257)"
        fill="none"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
      />
    </g>
  </svg>
);

const icons = {
  home: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  menu: (
    <svg className="h-4 w-4" viewBox="0 0 512 512.001" fill="currentColor" aria-hidden>
      <path d="M135.746 380.71c-.988 1.798-2.52 2.337-3.957 2.337s-2.875-.54-3.863-2.336l-10.34-19.418v39.371c0 2.43-2.965 3.688-5.84 3.688-2.969 0-5.844-1.258-5.844-3.688V344.48c0-4.312 2.875-5.84 5.844-5.84 4.223 0 6.113.9 9.078 6.2l11.059 20.137 11.054-20.137c2.97-5.3 4.946-6.2 9.172-6.2 2.965 0 5.84 1.528 5.84 5.84v56.184c0 2.43-2.965 3.688-5.84 3.688-2.968 0-5.843-1.258-5.843-3.688v-38.652zM190.484 366.863h13.664c2.336 0 3.684 2.25 3.684 4.676 0 2.066-1.168 4.496-3.684 4.496h-13.664v18.067h25.438c2.34 0 3.687 2.425 3.687 5.214 0 2.426-1.168 5.036-3.687 5.036h-32c-2.606 0-5.125-1.262-5.125-3.688v-58.34c0-2.426 2.516-3.687 5.125-3.687h32c2.52 0 3.687 2.61 3.687 5.035 0 2.789-1.347 5.215-3.687 5.215h-25.438zM267.52 400.664l-19.329-36.137v36.137c0 2.43-2.964 3.688-5.843 3.688-2.965 0-5.844-1.258-5.844-3.688v-58.34c0-2.515 2.879-3.683 5.844-3.683 4.226 0 5.933.898 8.722 6.199l17.348 33.531v-36.137c0-2.515 2.875-3.597 5.844-3.597 2.875 0 5.84 1.078 5.84 3.597v58.43c0 2.426-2.965 3.688-5.84 3.688-2.79 0-5.215-.899-6.742-3.688zM332.148 342.234c0-2.515 2.875-3.593 5.84-3.593 2.88 0 5.844 1.078 5.844 3.593v42.07c0 15.012-9.527 20.587-21.574 20.587-12.137 0-21.574-5.575-21.574-20.586v-42.07c0-2.516 2.875-3.594 5.843-3.594 2.875 0 5.84 1.078 5.84 3.593v42.07c0 7.012 3.688 10.34 9.89 10.34 6.204 0 9.888-3.328 9.888-10.34v-42.07zM355.258 422.148h-42.73a7.591 7.591 0 0 0-7.594 7.59 7.589 7.589 0 0 0 7.593 7.59h42.73a7.585 7.585 0 0 0 7.59-7.59 7.588 7.588 0 0 0-7.59-7.59zM277.207 422.148H104.266a7.59 7.59 0 0 0 0 15.18h172.941a7.585 7.585 0 0 0 7.59-7.59 7.588 7.588 0 0 0-7.59-7.59zM355.258 306.242H104.266a7.59 7.59 0 0 0 0 15.18h250.992a7.588 7.588 0 0 0 7.59-7.59 7.588 7.588 0 0 0-7.59-7.59zM351.035 212.129h-7.367c-2.844-52.3-41.074-95.34-91.11-105.527l1.465-14.004a16.25 16.25 0 0 0-4.086-12.559 16.261 16.261 0 0 0-12.066-5.371h-16.215c-4.597 0-8.992 1.96-12.07 5.371a16.256 16.256 0 0 0-4.082 12.559l1.465 14.004c-50.035 10.187-88.266 53.222-91.11 105.523h-7.367c-6.515 0-11.816 5.3-11.816 11.816v15.664c0 6.516 5.3 11.817 11.816 11.817h242.54c6.515 0 11.816-5.3 11.816-11.817v-15.664c0-6.511-5.297-11.812-11.813-11.812zM220.867 90.199c.211-.23.473-.347.79-.347h16.214c.313 0 .578.117.79.347.21.235.3.512.265.82l-1.418 13.563c-2.559-.172-5.14-.27-7.742-.27-2.606 0-5.184.098-7.743.27l-1.421-13.562a1.04 1.04 0 0 1 .265-.82zm126.801 146.043H111.859v-8.933h31.989c4.195 0 7.593-3.399 7.593-7.59s-3.398-7.59-7.593-7.59H131.07c3.242-51.625 46.266-92.633 98.692-92.633 52.43 0 95.453 41.008 98.695 92.633H179.168c-4.195 0-7.59 3.398-7.59 7.59s3.395 7.59 7.59 7.59h168.5zm0 0" />
      <path d="M409.484 0H50.043C39.387 0 30.715 8.672 30.715 19.328V33.04h-7.082C10.602 33.04 0 43.645 0 56.676s10.602 23.636 23.633 23.636h7.082v32.458h-7.082C10.602 112.77 0 123.37 0 136.406c0 13.031 10.602 23.633 23.633 23.633h7.082V192.5h-7.082C10.602 192.5 0 203.102 0 216.137c0 13.031 10.602 23.633 23.633 23.633h7.082v32.46h-7.082C10.602 272.23 0 282.832 0 295.863 0 308.898 10.602 319.5 23.633 319.5h7.082v32.46h-7.082C10.602 351.96 0 362.564 0 375.595c0 13.035 10.602 23.636 23.633 23.636h7.082v32.461h-7.082C10.602 431.691 0 442.293 0 455.324s10.602 23.637 23.633 23.637h7.082v13.71c0 10.657 8.672 19.329 19.328 19.329h359.441c10.657 0 19.332-8.672 19.332-19.328V19.328C428.816 8.672 420.141 0 409.484 0zM30.711 65.133h-7.078c-4.66 0-8.453-3.793-8.453-8.457 0-4.66 3.793-8.453 8.453-8.453h7.078zm0 79.726h-7.078c-4.66 0-8.453-3.793-8.453-8.453 0-4.664 3.793-8.453 8.453-8.453h7.078zm0 79.73h-7.078c-4.66 0-8.453-3.792-8.453-8.452 0-4.664 3.793-8.457 8.453-8.457h7.078zm0 79.731h-7.078c-4.66 0-8.453-3.793-8.453-8.457 0-4.66 3.793-8.453 8.453-8.453h7.078zm0 79.727h-7.078c-4.66 0-8.453-3.79-8.453-8.453 0-4.66 3.793-8.453 8.453-8.453h7.078zm0 79.73h-7.078c-4.66 0-8.453-3.793-8.453-8.453 0-4.664 3.793-8.453 8.453-8.453h7.078zm382.922 28.891c0 2.289-1.86 4.152-4.149 4.152H50.043a4.154 4.154 0 0 1-4.148-4.152V19.328a4.154 4.154 0 0 1 4.148-4.148h359.441a4.154 4.154 0 0 1 4.149 4.148zm0 0" />
    </svg>
  ),
  cart: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  profile: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  dashboard: (
    <svg className="h-4 w-4" viewBox="0 0 682.667 682.667" fill="none" aria-hidden>
      <defs>
        <clipPath id="nav-dashboard-icon-clip" clipPathUnits="userSpaceOnUse">
          <path d="M0 512h512V0H0Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#nav-dashboard-icon-clip)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
        <path
          d="M0 0c0-22.091-17.909-40-40-40h-120c-22.091 0-40 17.909-40 40v160c0 22.091 17.909 40 40 40h120c22.091 0 40-17.909 40-40z"
          transform="translate(220 292)"
          fill="none"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
        />
        <path
          d="M0 0c0-22.091-17.909-40-40-40h-120c-22.091 0-40 17.909-40 40v160c0 22.091 17.909 40 40 40h120c22.091 0 40-17.909 40-40z"
          transform="translate(492 60)"
          fill="none"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
        />
        <path
          d="M0 0c0-22.091-17.909-40-40-40h-120c-22.091 0-40 17.909-40 40v80c0 22.091 17.909 40 40 40h120c22.091 0 40-17.909 40-40z"
          transform="translate(220 60)"
          fill="none"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
        />
        <path
          d="M0 0c0-22.091-17.909-40-40-40h-120c-22.091 0-40 17.909-40 40v80c0 22.091 17.909 40 40 40h120c22.091 0 40-17.909 40-40z"
          transform="translate(492 372)"
          fill="none"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
        />
      </g>
    </svg>
  ),
  orders: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  loyalty: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H5.5M12 8h4.5a2.5 2.5 0 010 5H12m0 0v5m0-5H8.5a2.5 2.5 0 000 5H12" />
    </svg>
  ),
  admin: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  delivery: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 011 1v1a1 1 0 01-1 1h-1M13 16V9h4l2 3v4h-6z" />
    </svg>
  ),
  platform: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  login: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  logout: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  branches: locationIcon,
  location: locationIcon,
  campaigns: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  reviews: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  restaurants: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  users: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  rbac: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

/** Customer-only navigation icons (header + bottom bar). */
export const customerIcons = {
  home: (
    <svg className="h-4 w-4" viewBox="0 0 512 512" fill="currentColor" aria-hidden>
      <path d="M506.555 208.064 263.859 30.367a13.3 13.3 0 0 0-15.716 0L5.445 208.064c-5.928 4.341-7.216 12.665-2.875 18.593s12.666 7.214 18.593 2.875L256 57.588l234.837 171.943a13.236 13.236 0 0 0 7.848 2.57c4.096 0 8.138-1.885 10.744-5.445 4.342-5.927 3.054-14.251-2.874-18.592z" />
      <path d="M442.246 232.543c-7.346 0-13.303 5.956-13.303 13.303v211.749H322.521V342.009c0-36.68-29.842-66.52-66.52-66.52s-66.52 29.842-66.52 66.52v115.587H83.058V245.847c0-7.347-5.957-13.303-13.303-13.303s-13.303 5.956-13.303 13.303V470.9c0 7.347 5.957 13.303 13.303 13.303h133.029c6.996 0 12.721-5.405 13.251-12.267.032-.311.052-.651.052-1.036V342.01c0-22.009 17.905-39.914 39.914-39.914s39.914 17.906 39.914 39.914V470.9c0 .383.02.717.052 1.024.524 6.867 6.251 12.279 13.251 12.279h133.029c7.347 0 13.303-5.956 13.303-13.303V245.847c-.001-7.348-5.957-13.304-13.304-13.304z" />
    </svg>
  ),
  cart: (
    <svg className="h-4 w-4" viewBox="0 0 512 512" fill="currentColor" aria-hidden>
      <path d="M164.96 300.004h.024c.02 0 .04-.004.059-.004H437a15.003 15.003 0 0 0 14.422-10.879l60-210a15.003 15.003 0 0 0-2.445-13.152A15.006 15.006 0 0 0 497 60H130.367l-10.722-48.254A15.003 15.003 0 0 0 105 0H15C6.715 0 0 6.715 0 15s6.715 15 15 15h77.969c1.898 8.55 51.312 230.918 54.156 243.71C131.184 280.64 120 296.536 120 315c0 24.812 20.188 45 45 45h272c8.285 0 15-6.715 15-15s-6.715-15-15-15H165c-8.27 0-15-6.73-15-15 0-8.258 6.707-14.977 14.96-14.996zM477.114 90l-51.43 180H177.032l-40-180zM150 405c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zM362 405c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm0 0" />
    </svg>
  ),
  menu: (
    <svg className="h-4 w-4" viewBox="0 0 512 512" fill="currentColor" aria-hidden>
      <path d="M487 373h-9.211c-3.557-53.731-26.17-103.758-64.601-142.188-38.43-38.432-88.457-61.045-142.188-64.602V143h18.686c8.284 0 15-6.716 15-15s-6.716-15-15-15h-67.372c-8.284 0-15 6.716-15 15s6.716 15 15 15H241v23.21c-53.731 3.557-103.758 26.17-142.189 64.601S37.767 319.269 34.21 373H25c-13.785 0-25 11.215-25 25 0 38.047 30.953 69 69 69h374c38.047 0 69-30.953 69-69 0-13.785-11.215-25-25-25zM69 437c-19.812 0-36.22-14.847-38.681-34H481.681c-2.461 19.153-18.869 34-38.681 34zm187-241.298c100.985 0 184.039 78.249 191.719 177.298H64.281C71.96 273.951 155.014 195.702 256 195.702z" />
      <path d="M240.112 258.754c.544 0 1.094-.03 1.647-.09 4.697-.513 9.489-.773 14.241-.773 8.284 0 15-6.716 15-15s-6.716-15-15-15c-5.836 0-11.723.32-17.498.951-8.235.899-14.182 8.304-13.283 16.54.84 7.682 7.339 13.372 14.893 13.372zM118.455 339.353a14.932 14.932 0 0 0 6.439 1.461c5.604 0 10.982-3.157 13.553-8.554 11.125-23.359 28.77-42.737 51.03-56.041 7.111-4.25 9.43-13.46 5.181-20.571-4.251-7.111-13.461-9.431-20.571-5.181-27.357 16.35-49.047 40.173-62.724 68.894-3.564 7.479-.388 16.431 7.092 19.992zM392.798 105h15v15c0 8.284 6.716 15 15 15s15-6.716 15-15v-15h15c8.284 0 15-6.716 15-15s-6.716-15-15-15h-15V60c0-8.284-6.716-15-15-15s-15 6.716-15 15v15h-15c-8.284 0-15 6.716-15 15s6.716 15 15 15zM35 162.525h15v15c0 8.284 6.716 15 15 15s15-6.716 15-15v-15h15c8.284 0 15-6.716 15-15s-6.716-15-15-15H80v-15c0-8.284-6.716-15-15-15s-15 6.716-15 15v15H35c-8.284 0-15 6.716-15 15s6.716 15 15 15z" />
    </svg>
  ),
  orders: (
    <svg className="h-4 w-4" viewBox="0 0 548.253 548.253" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M497.252 44.625v484.5a19.123 19.123 0 0 1-10.2 16.906 19.1 19.1 0 0 1-19.712-1.122l-63.622-43.426-60.155 43.172c-7.217 5.202-17.06 4.717-23.741-1.148l-45.696-39.958-45.696 39.958c-6.681 5.865-16.524 6.35-23.74 1.148l-60.155-43.172-63.622 43.426a19.103 19.103 0 0 1-19.712 1.122 19.125 19.125 0 0 1-10.2-16.906v-484.5C51.002 19.992 70.968 0 95.627 0h357c24.658 0 44.625 19.992 44.625 44.625zm-38.25 0a6.377 6.377 0 0 0-6.375-6.375h-357a6.377 6.377 0 0 0-6.375 6.375v448.29l44.778-30.574a19.099 19.099 0 0 1 21.93.255l58.701 42.151 46.869-41.004a19.1 19.1 0 0 1 25.194 0l46.869 41.004 58.701-42.151a19.099 19.099 0 0 1 21.93-.255l44.778 30.574z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M172.127 140.25c-10.557 0-19.125-8.568-19.125-19.125S161.57 102 172.127 102h204c10.557 0 19.125 8.568 19.125 19.125s-8.568 19.125-19.125 19.125zM172.127 242.25c-10.557 0-19.125-8.568-19.125-19.125S161.57 204 172.127 204h204c10.557 0 19.125 8.568 19.125 19.125s-8.568 19.125-19.125 19.125zM172.127 344.25c-10.557 0-19.125-8.568-19.125-19.125S161.57 306 172.127 306h102c10.557 0 19.125 8.568 19.125 19.125s-8.568 19.125-19.125 19.125z"
      />
    </svg>
  ),
  profile: (
    <svg className="h-4 w-4" viewBox="0 0 682.667 682.667" fill="none" aria-hidden>
      <defs>
        <clipPath id="customer-profile-icon-clip" clipPathUnits="userSpaceOnUse">
          <path d="M0 512h512V0H0Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#customer-profile-icon-clip)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
        <path
          d="M0 0c0-133.101-107.9-241-241-241-133.103 0-241 107.899-241 241 0 133.103 107.897 241 241 241C-107.9 241 0 133.103 0 0Z"
          transform="translate(497 256)"
          stroke="currentColor"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0 0c0-53.24-43.158-96.4-96.4-96.4-53.244 0-96.401 43.16-96.401 96.4 0 53.239 43.157 96.399 96.401 96.399C-43.158 96.399 0 53.239 0 0Z"
          transform="translate(352.4 288.134)"
          stroke="currentColor"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0 0c7.71 72.602 69.142 129.158 143.787 129.158 74.647 0 136.078-56.56 143.785-129.16"
          transform="translate(112.213 62.575)"
          stroke="currentColor"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  ),
  location: locationIcon,
};

function applyCustomerIcons(links) {
  return links.map((link) => {
    if (link.id === 'home') return { ...link, icon: customerIcons.home };
    if (link.id === 'menu') return { ...link, icon: customerIcons.menu };
    if (link.id === 'cart') return { ...link, icon: customerIcons.cart };
    if (link.id === 'cust-orders' || link.id === 'admin-orders') return { ...link, icon: customerIcons.orders };
    return link;
  });
}

function isDriverOnlySession(buckets) {
  return buckets.has('delivery') && !buckets.has('customer');
}

export const navIcons = icons;

export const ADMIN_NAV_ITEMS = applyCustomerIcons([
  { id: 'admin-dashboard', to: '/admin/dashboard', label: 'Dashboard', icon: icons.dashboard, group: 'staff' },
  { id: 'admin-menu', to: '/admin/menu', label: 'Menu', icon: icons.menu, group: 'staff' },
  { id: 'admin-orders', to: '/admin/orders', label: 'Orders', icon: icons.orders, group: 'staff' },
  { id: 'admin-branches', to: '/admin/branches', label: 'Branches', icon: icons.branches, group: 'staff' },
  { id: 'admin-delivery', to: '/admin/delivery', label: 'Delivery', icon: icons.delivery, group: 'staff' },
  { id: 'admin-campaigns', to: '/admin/campaigns', label: 'Campaigns', icon: icons.campaigns, group: 'staff' },
  { id: 'admin-reviews', to: '/admin/reviews', label: 'Reviews', icon: icons.reviews, group: 'staff' },
]);

export const PLATFORM_NAV_ITEMS = [
  { id: 'platform-dashboard', to: '/platform/dashboard', label: 'Dashboard', icon: icons.dashboard, group: 'staff' },
  { id: 'platform-restaurants', to: '/platform/restaurants', label: 'Restaurants', icon: icons.restaurants, group: 'staff' },
  { id: 'platform-users', to: '/platform/users', label: 'Users', icon: icons.users, group: 'staff' },
  { id: 'platform-rbac', to: '/platform/rbac', label: 'RBAC', icon: icons.rbac, group: 'staff' },
];

export const DELIVERY_NAV_ITEMS = [
  { id: 'delivery-dashboard', to: '/delivery/dashboard', label: 'Dashboard', icon: icons.dashboard, group: 'staff' },
];

const STAFF_BUCKETS = ['restaurant', 'delivery', 'platform'];

function hasAnySessionToken() {
  try {
    const raw = localStorage.getItem('auth_sessions');
    const sessions = raw ? JSON.parse(raw) : {};
    return Object.values(sessions).some((s) => s?.access_token);
  } catch {
    return false;
  }
}

function hasStaffSession(buckets) {
  return STAFF_BUCKETS.some((b) => buckets.has(b));
}

/** Staff nav (Admin, Deliveries, Platform) — never shown to guests or customers. */
function shouldShowStaffNav(buckets) {
  if (!hasStaffSession(buckets)) return false;
  if (buckets.has('customer')) return false;
  return true;
}

/** Build visible navbar links from active login sessions. */
export function buildNavLinks(activeSessions = []) {
  const buckets = new Set(activeSessions.map((s) => s.bucket));
  const showCart = canUseCartFeatures(activeSessions);
  const showStaffNav = shouldShowStaffNav(buckets);
  const driverOnly = isDriverOnlySession(buckets);

  const links = [];

  if (!driverOnly) {
    links.push(
      { id: 'home', to: '/', label: 'Home', end: true, icon: icons.home, group: 'public' },
      { id: 'menu', to: '/menu', label: 'Menu', icon: icons.menu, group: 'public' }
    );
  }

  if (showCart) {
    links.push({ id: 'cart', to: '/cart', label: 'Cart', icon: icons.cart, isCart: true, group: 'public' });
  }

  if (buckets.has('customer')) {
    links.push(
      { id: 'cust-orders', to: '/customer/orders', label: 'Orders', icon: icons.orders, group: 'customer' }
    );
    return applyCustomerIcons(links);
  } else if (shouldShowLogin(activeSessions)) {
    links.push({ id: 'login', to: '/login', label: 'Login', icon: icons.login, isAuth: true, group: 'auth' });
  }

  if (showStaffNav) {
    if (buckets.has('delivery')) {
      links.push({
        id: 'driver',
        to: '/delivery/dashboard',
        label: 'Dashboard',
        icon: icons.dashboard,
        group: 'staff',
      });
    }
    if (buckets.has('platform')) {
      links.push({ id: 'platform', to: '/platform/dashboard', label: 'Super Admin', icon: icons.platform, group: 'staff' });
    }
  }

  if (driverOnly) {
    return links;
  }

  return applyCustomerIcons(links);
}

const BOTTOM_NAV_FALLBACKS = [
  { id: 'home', to: '/', label: 'Home', end: true, icon: icons.home, group: 'public' },
  { id: 'menu', to: '/menu', label: 'Menu', icon: icons.menu, group: 'public' },
];

function padBottomNavLinks(links) {
  const seen = new Set(links.map((l) => l.id));
  const padded = [...links];

  for (const fallback of BOTTOM_NAV_FALLBACKS) {
    if (padded.length >= 4) break;
    if (!seen.has(fallback.id)) {
      padded.push(fallback);
      seen.add(fallback.id);
    }
  }

  return padded.slice(0, 4);
}

/** Bottom bar links — exactly 4 items (profile is appended separately in BottomNav). */
export function buildBottomNavLinks(activeSessions = [], pathname = '/') {
  const buckets = new Set(activeSessions.map((s) => s.bucket));
  const driverOnly = isDriverOnlySession(buckets);
  const isStaffRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/platform') ||
    pathname.startsWith('/delivery');

  if (isStaffRoute && isStaffOnlyHeader(activeSessions)) {
    if (pathname.startsWith('/admin')) {
      return ADMIN_NAV_ITEMS.slice(0, 4);
    }
    if (pathname.startsWith('/platform')) {
      return PLATFORM_NAV_ITEMS.slice(0, 4);
    }
    if (pathname.startsWith('/delivery')) {
      return DELIVERY_NAV_ITEMS;
    }
  }

  if (driverOnly) {
    return DELIVERY_NAV_ITEMS;
  }

  const links = buildNavLinks(activeSessions).filter((l) => !l.isAuth);
  return padBottomNavLinks(links);
}

/** Staff signed in without a customer session — dashboard in header, profile via dropdown. */
export function isStaffOnlyHeader(activeSessions = []) {
  const buckets = new Set(activeSessions.map((s) => s.bucket));
  return shouldShowStaffNav(buckets);
}

export function shouldShowLogin(activeSessions = []) {
  return activeSessions.length === 0 && !hasAnySessionToken();
}

export function shouldShowLogout(activeSessions = []) {
  return activeSessions.length > 0 || hasAnySessionToken();
}