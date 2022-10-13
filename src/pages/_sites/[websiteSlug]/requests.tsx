import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NetworkStatus, useQuery, gql } from '@apollo/client';

import { parseContextCookie } from '@utils/parse-cookie';
import { useCustomer } from '@contexts/customer.context';
import HomeLayout from '@components/layout/home-layout';
import Button from '@components/ui/button';
import NoData from '@components/common/no-data';
import ErrorMessage from '@components/ui/error-message';
import Spinner from '@components/ui/loaders/spinner/spinner';
import Scrollbar from '@components/ui/scrollbar';
import RequestOwnCard from '@components/request/request-own-card';
import RequestOwnDetails from '@components/request/request-own-details';
import { useFindManyRequestCountQuery } from '@generated';
import prisma from 'admin/src/server/context/prisma';
import processWebsite from '@process/website';

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const cookies = parseContextCookie(context?.req?.headers?.cookie);
  const websiteSlug = context.req.headers.host.split('.')[0];

  if (!cookies?.magic_token) {
    return { redirect: { destination: '/', permanent: false } };
  }
  const website = await prisma.website.findUnique({
    where: {
      slug: websiteSlug,
    },
    include: {
      pages: true,
    },
  });
  return {
    props: {
      website: processWebsite(website),
      ...(await serverSideTranslations(context.locale, ['common', 'request'])),
    },
  };
};

export default function RequestsPage() {
  const { t } = useTranslation('common');
  const { t: tRequest } = useTranslation('request');
  const [request, setRequest] = useState<any>({});
  const { customer } = useCustomer();
  const [take, setTake] = useState(10);
  const variables = (_customer, _take) => {
    return {
      where: {
        customer: {
          id: {
            equals: _customer?.id,
          },
        },
      },
      take: _take,
    };
  };
  const { data: requestCountData } = useFindManyRequestCountQuery({
    variables: variables(customer),
    skip: !customer?.id,
  });

  const { data, loading, error, networkStatus, fetchMore } = useQuery(
    gql`
      query findManyRequest($where: RequestWhereInput) {
        findManyRequest(where: $where) {
          id
          createdAt
          name
          description
          message
          price
          subject
          days
          expiredAt
          url
          acceptBefore
          transactionHash
          walletAddress
          requestStatus
          page {
            id
            name
            slug
            imageObj
          }
          imageObj
        }
      }
    `,
    {
      variables: variables(customer, take),
      skip: !customer?.id,
    },
  );

  useEffect(() => {
    if (data?.findManyRequest?.length) {
      setRequest(data.findManyRequest[0]);
    }
  }, [data?.findManyRequest?.length]);
  if (error) return <ErrorMessage message={error.message} />;
  const loadingMore = networkStatus === NetworkStatus.fetchMore;
  function handleLoadMore() {
    if (requestCountData?.findManyRequestCount > take) {
      fetchMore({
        variables: variables(customer, take + 10),
      });
      setTake(take + 10);
    }
  }

  return (
    <div className="bg-gray-50 mt-[84px]">
      {data?.findManyRequest?.length ? (
        <Grid sx={{ height: 'calc(100vh - 84px)' }} container className="px-4">
          <Grid item xs={12} md={4} className="py-5 md:px-4">
            <div className="text-xl font-bold mb-2">{tRequest('request-list-title')}</div>
            <div className="text-sm text-gray-800 mb-2">{tRequest('request-list-description')}</div>
            <Scrollbar className="w-full" style={{ height: 'calc(100% - 64px)' }}>
              {loading && !data?.findManyRequest?.length ? (
                <p>
                  <Spinner showText={false} />
                </p>
              ) : (
                <>
                  {data?.findManyRequest?.map((_request, index) => (
                    <RequestOwnCard
                      key={index}
                      request={_request}
                      onClick={() => setRequest(_request)}
                      isActive={request?.id === _request?.id}
                    />
                  ))}
                  {requestCountData?.findManyRequestCount > take && (
                    <div className="flex justify-center mt-8 lg:mt-12">
                      <Button
                        loading={loadingMore}
                        onClick={handleLoadMore}
                        className="text-sm md:text-base font-semibold h-11"
                      >
                        {t('text-load-more')}
                      </Button>
                    </div>
                  )}
                </>
              )}
              {!loading && !data?.findManyRequest?.length && (
                <div className="w-full h-full flex items-center justify-center my-auto">
                  <h4 className="text-sm font-semibold text-body text-center">{t('error-no-orders')}</h4>
                </div>
              )}
            </Scrollbar>
          </Grid>
          <Grid item xs={12} md={8} className="py-5 px-4 hidden lg:block">
            <div className="text-xl font-bold mb-2">{tRequest('request-detail-title')}</div>
            <div className="text-sm text-gray-800 mb-2">{tRequest('request-detail-description')}</div>
            {request ? (
              <Scrollbar className="w-full" style={{ height: 'calc(100% - 64px)' }}>
                <RequestOwnDetails request={request} />
              </Scrollbar>
            ) : (
              <div className="flex justify-center items-center" style={{ height: 'calc(100% - 64px)' }}>
                <NoData text={tRequest('request-list-unselected')} type="data" />
              </div>
            )}
          </Grid>
        </Grid>
      ) : (
        <div className="flex justify-center items-center" style={{ height: 'calc(100vh - 84px)' }}>
          <NoData text={tRequest('request-list-empty')} type="request" />
        </div>
      )}
    </div>
  );
}
