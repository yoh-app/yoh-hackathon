import React from "react";
import { siteSettings } from "@settings/site.settings";
import { useFindManyRequestQuery } from "@generated";
import { useRouter } from 'next/router'
import processItem from "@process/item";
type State = typeof initialState;

const initialState = {
  siteTitle: siteSettings.name,
  siteSubtitle: siteSettings.description,
  currency: siteSettings.currencyCode,
  logo: {
    id: 1,
    thumbnail: siteSettings.logo.url,
    original: siteSettings.logo.url,
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: {
      id: 1,
      thumbnail: "",
      original: "",
    },
    twitterHandle: "",
    twitterCardType: "",
    metaTags: "",
    canonicalUrl: "",
  },
  google: {
    isEnable: false,
    tagManagerId: "",
  },
  facebook: {
    isEnable: false,
    appId: "",
    pageId: "",
  },
};

export const SettingsContext = React.createContext<State | any>(initialState);

SettingsContext.displayName = "SettingsContext";

export const SettingsProvider: React.FC<{ initialValue: any }> = ({
  initialValue,
  ...props
}) => {
  const [state] = React.useState(initialValue ?? initialState);
  const router = useRouter()
  const indexPage = state?.pages?.find((page) => page.isIndex);

  const { data } = useFindManyRequestQuery({
    variables: {
      where: {
        active: {
          equals: true,
        },
        page: {
          slug: {
            equals: router?.query?.pageSlug || indexPage?.slug,
          },
        },
        requestStatus: {
          in: 'active',
        },
      },
    },
    skip: !(router?.asPath === '/' || router?.asPath?.includes('/pages/'))
  });
  const requests = data?.findManyRequest?.filter((request) => {
    const expiredAtTime = new Date(request.expiredAt).getTime()
    const currentTime = new Date().getTime()
    if (expiredAtTime > currentTime) {
      return true
    } else {
      return false
    }
  }).map((request) => processItem(request))
  return <SettingsContext.Provider value={{
    ...state, hasRequests: requests?.length > 0, requests
  }} {...props} />;
};

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(`useSettings must be used within a SettingsProvider`);
  }
  return context;
};
