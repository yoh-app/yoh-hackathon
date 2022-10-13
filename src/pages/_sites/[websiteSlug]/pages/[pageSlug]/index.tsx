import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { HtmlTag } from 'admin/src/components/craft/selectors/HtmlTag';
import { HtmlText } from 'admin/src/components/craft/selectors/HtmlText';
import { HtmlImg } from 'admin/src/components/craft/selectors/HtmlImg';
import { HtmlButton } from 'admin/src/components/craft/selectors/HtmlButton';

import { HtmlSection } from 'admin/src/components/craft/selectors/HtmlSection';
import { Collection } from 'admin/src/components/craft/selectors/Collection';
import { Embed } from 'admin/src/components/craft/selectors/Embed';

import { Root } from 'admin/src/components/craft/selectors/Root';
import { Editor, Frame } from '@craftjs/core';
import React from 'react';
import prisma from 'admin/src/server/context/prisma';
import processPage from '@process/page';

import RequestBlockDesktop from '@components/request/request-block-desktop';
import RequestBlockMobile from '@components/request/request-block-mobile';

import { useWindowSize } from '@utils/use-window-size';

import { useFindManyRequestQuery } from '@generated';
import processItem from '@process/item';
import { CraftProvider } from 'admin/src/components/craft/editor/CraftContext';
import processWebsite from '@process/website';
import HomeLayout from '@components/layout/home-layout';
import { PageViewTracker } from '@components/pageViewTracker';
import { useSettings } from '@contexts/settings.context';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import Spinner from '@components/ui/loaders/spinner/spinner';
import { useTranslation } from 'next-i18next';

export default function Home({ page, website }: Record<string, any>) {
  const size = useWindowSize();
  const [showRequests, setShowRequests] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const isMobile = size.width < 768;
  const { requests, hasRequests } = useSettings()

  const { t } = useTranslation('common')
  const router = useRouter()
  if (router.isFallback) {
    return <div className="flex justify-center items-center bg-light relative">
      <Spinner text='Loading' />
    </div>
  }
  return (
    <>
      <NextSeo
        openGraph={{
          url: `https://${website?.slug}.${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}/pages/${page?.slug}`,
          title: page?.name,
          description: page?.description,
          images: [
            { url: website?.imageObj?.url },
            { url: page?.imageObj?.url },
          ],
          site_name: website?.name,
        }}
        title={page?.name}
        description={page?.description}
        canonical={`https://${website?.slug}.${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}/pages/${page?.slug}`}
      />
      {hasRequests && <RequestBlockDesktop showRequests={true} requests={requests} />}
      <div
        style={
          hasRequests && !isMobile
            ? {
              width: 'calc(100% - 300px)',
              marginRight: '300px',
              // padding: '20px',
            }
            : hasRequests && isMobile
              ? {
                marginBottom: '170px',
              }
              : null
        }
      >
        <CraftProvider>
          <Editor
            resolver={{
              HtmlTag,
              HtmlButton,
              HtmlText,
              HtmlSection,
              HtmlImg,
              Collection,
              Root,
              Embed,
            }}
            enabled={false}
          >
            <Frame data={page?.content}></Frame>
          </Editor>
        </CraftProvider>
        {/* {page?.items?.slice(1).map((item: Record<string, any>, index: number) => renderSection(item, index))} */}
      </div>
      {hasRequests && <RequestBlockMobile showRequests={showRequests} requests={requests} />}
      {page && <PageViewTracker page={page} />}
    </>
  );
}

export const getStaticPaths = async ({ locales }) => {
  // const pages = await prisma.page.findMany({
  //   where: {},
  //   include: {
  //     website: true,
  //   },
  // });
  // const paths = pages
  //   .filter((page) => page.active && !page.deleted && page.website && page.website.active && !page.website.deleted)
  //   .map((page) =>
  //     locales.map((locale) => ({
  //       params: {
  //         pageSlug: page?.slug,
  //         websiteSlug: page?.website?.slug,
  //       },
  //       locale, // Pass locale here
  //     })),
  //   )
  //   .flat();
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  if (!params) throw new Error('No path parameters found');

  const { pageSlug, websiteSlug } = params;
  const page = await prisma.page.findUnique({
    where: {
      slug: pageSlug,
    },
    include: {
      website: true,
    },
  });
  const website = await prisma.website.findUnique({
    where: {
      slug: websiteSlug,
    },
    include: {
      pages: true,
    },
  });

  if (!page || !website)
    return {
      notFound: true,
      // revalidate: 10,
      props: {
        ...(await serverSideTranslations(locale!, ['common'])),
      },
    };

  return {
    props: {
      website: processWebsite(website),
      page: processPage(page),
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    // revalidate: 20,
  };
};
