import { cn } from '~/lib/utils'

interface LogoProps extends React.SVGProps<SVGSVGElement> {}

const Logo = ({ className, ...props }: LogoProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="264"
      height="264"
      fill="none"
      viewBox="0 0 264 264"
      className={cn('h-8 w-8', className)}
      {...props}
    >
      <g filter="url(#filter0_b_306_217)">
        <path
          fill="#C6D228"
          fillRule="evenodd"
          d="M57.319 0a8 8 0 00-8 8v42.933a4 4 0 014-4h142.857a4 4 0 014 4v39.484a4 4 0 01-4 4h-84.61a4 4 0 00-4 4v29.308a4 4 0 004 4h75.391a4 4 0 014 4v39.483a4 4 0 01-4 4h-75.391a4 4 0 00-4 4v33.859H256a8 8 0 008-8V8a8 8 0 00-8-8H57.319z"
          clipRule="evenodd"
        ></path>
      </g>
      <g filter="url(#filter1_b_306_217)">
        <mask id="path-2-inside-1_306_217" fill="#fff">
          <path
            fillRule="evenodd"
            d="M8 46.933a8 8 0 00-8 8V256a8 8 0 008 8h198.681a8 8 0 008-8V54.933a8 8 0 00-8-8h-10.505a4 4 0 014 4v39.484a4 4 0 01-4 4h-84.61a4 4 0 00-4 4v29.308a4 4 0 004 4h75.391a4 4 0 014 4v39.483a4 4 0 01-4 4h-75.391a4 4 0 00-4 4v33.859H57.319a8 8 0 01-8-8V50.933a4 4 0 014-4H8z"
            clipRule="evenodd"
          ></path>
        </mask>
        <path
          fill="#949C1E"
          fillRule="evenodd"
          d="M8 46.933a8 8 0 00-8 8V256a8 8 0 008 8h198.681a8 8 0 008-8V54.933a8 8 0 00-8-8h-10.505a4 4 0 014 4v39.484a4 4 0 01-4 4h-84.61a4 4 0 00-4 4v29.308a4 4 0 004 4h75.391a4 4 0 014 4v39.483a4 4 0 01-4 4h-75.391a4 4 0 00-4 4v33.859H57.319a8 8 0 01-8-8V50.933a4 4 0 014-4H8z"
          clipRule="evenodd"
        ></path>
        <path
          fill="#C6D228"
          d="M107.566 217.067v1h1v-1h-1zM1 54.933a7 7 0 017-7v-2a9 9 0 00-9 9h2zM1 256V54.933h-2V256h2zm7 7a7 7 0 01-7-7h-2a9 9 0 009 9v-2zm198.681 0H8v2h198.681v-2zm7-7a7 7 0 01-7 7v2a9 9 0 009-9h-2zm0-201.067V256h2V54.933h-2zm-7-7a7 7 0 017 7h2a9 9 0 00-9-9v2zm-10.505 0h10.505v-2h-10.505v2zm5 3a5 5 0 00-5-5v2a3 3 0 013 3h2zm0 39.484V50.933h-2v39.484h2zm-5 5a5 5 0 005-5h-2a3 3 0 01-3 3v2zm-84.61 0h84.61v-2h-84.61v2zm-3 3a3 3 0 013-3v-2a5 5 0 00-5 5h2zm0 29.308V98.417h-2v29.308h2zm3 3a3 3 0 01-3-3h-2a5 5 0 005 5v-2zm75.391 0h-75.391v2h75.391v-2zm5 5a5 5 0 00-5-5v2a3 3 0 013 3h2zm0 39.483v-39.483h-2v39.483h2zm-5 5a5 5 0 005-5h-2a3 3 0 01-3 3v2zm-75.391 0h75.391v-2h-75.391v2zm-3 3a3 3 0 013-3v-2a5 5 0 00-5 5h2zm0 33.859v-33.859h-2v33.859h2zm-51.247 1h50.247v-2H57.319v2zm-9-9a9 9 0 009 9v-2a7 7 0 01-7-7h-2zm0-158.134v158.134h2V50.933h-2zm5-5a5 5 0 00-5 5h2a3 3 0 013-3v-2zM8 47.933h45.319v-2H8v2z"
          mask="url(#path-2-inside-1_306_217)"
        ></path>
      </g>
      <defs>
        <filter
          id="filter0_b_306_217"
          width="230.681"
          height="233.067"
          x="41.319"
          y="-8"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feGaussianBlur
            in="BackgroundImageFix"
            stdDeviation="4"
          ></feGaussianBlur>
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_306_217"
          ></feComposite>
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_306_217"
            result="shape"
          ></feBlend>
        </filter>
        <filter
          id="filter1_b_306_217"
          width="230.681"
          height="233.067"
          x="-8"
          y="38.933"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feGaussianBlur
            in="BackgroundImageFix"
            stdDeviation="4"
          ></feGaussianBlur>
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_306_217"
          ></feComposite>
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_306_217"
            result="shape"
          ></feBlend>
        </filter>
      </defs>
    </svg>
  )
}

export { Logo }
