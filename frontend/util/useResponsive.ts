import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export interface BreakpointConfig {
  sm: number;  // Small devices (phones)
  md: number;  // Medium devices (tablets)
  lg: number;  // Large devices (desktops)
  xl: number;  // Extra large devices
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useResponsive(customBreakpoints?: Partial<BreakpointConfig>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: { window: any }) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;

  return {
    width,
    height,
    isSm: width >= breakpoints.sm,
    isMd: width >= breakpoints.md,
    isLg: width >= breakpoints.lg,
    isXl: width >= breakpoints.xl,
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    currentBreakpoint: width >= breakpoints.xl ? 'xl' :
                      width >= breakpoints.lg ? 'lg' :
                      width >= breakpoints.md ? 'md' : 'sm',
  };
}

export default useResponsive;
