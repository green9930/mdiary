import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize(`${process.env.REACT_APP_GA_TRACKING_ID}`);
};

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.send("pageview");
};

export const logClickEvent = (target: string) => {
  ReactGA.event({
    category: "Button",
    action: "ClickTest",
    label: "MDD ClickTest",
  });
};
