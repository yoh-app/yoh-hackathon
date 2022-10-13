import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { Grid, Button as MuiButton, Card } from '@mui/material';
// import Alert from '@components/ui/alert';
import Input from '@components/ui/input';
import Button from '@components/ui/button';
import { useTranslation } from 'next-i18next';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateOneRequestMutation } from '@generated';
import { useRouter } from 'next/router';
import Upload from 'client/src/components/upload/Upload';
import { useSettings } from '@contexts/settings.context';
import { useCustomer } from '@contexts/customer.context';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import prisma from 'admin/src/server/context/prisma';
import processPage from '@process/page';
import { ArrowNextIcon } from '@components/icons/arrow-next';
import processWebsite from '@process/website';
import HomeLayout from '@components/layout/home-layout';
import { gql, useQuery } from '@apollo/client';
import { parseContextCookie } from '@utils/parse-cookie';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

type FormValues = {
  subject: string;
  message: string;
  name: string;
  description: string;
  url: string;
  price: number;
  // days: number;
  acceptBefore: any;
};

const loginFormSchema = yup.object().shape({
  subject: yup.string().required(),
  message: yup.string().required(),
  name: yup.string().required(),
  description: yup.string().required(),
  url: yup
    .string()
    .matches(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please enter a valud url. Remember to add https',
    )
    .required(),
  // days: yup.number().required(),
  price: yup.number().positive().integer().required(),
  // acceptBefore: yup.date().required(),
});

export default function ({ page, website }) {
  const { t } = useTranslation('common');
  const { t: tRequest } = useTranslation('request');

  const [createRequest] = useCreateOneRequestMutation();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<Record<string, any> | null>(null);
  const [image, setImage] = useState<Record<string, any> | null>(null);
  const { customer }: Record<string, any> = useCustomer();
  const { query } = useRouter();
  const { indexPageSlug, currency } = website;
  const slug = query?.pageSlug ?? indexPageSlug;
  const pageViewSeries = page?.pageViews?.reduce((prev: Record<string, any>, current: Record<string, any>) => {
    const orderDate = new Date(current.createdAt).getMonth() + 1 + '/' + new Date(current.createdAt).getDate();
    const existItem = prev.find((item: Record<string, any>) => item.date === orderDate);
    if (!existItem) {
      prev.push({
        date: orderDate,
        amount: 1,
      });
    } else {
      existItem.amount++;
    }
    return prev;
  }, []);
  const requestClicksSeries = page?.requestClicks?.reduce((prev: Record<string, any>, current: Record<string, any>) => {
    const orderDate = new Date(current.createdAt).getMonth() + 1 + '/' + new Date(current.createdAt).getDate();
    const existItem = prev.find((item: Record<string, any>) => item.date === orderDate);
    if (!existItem) {
      prev.push({
        date: orderDate,
        amount: 1,
      });
    } else {
      existItem.amount++;
    }
    return prev;
  }, []);
  const placeholderImage = `/assets/placeholder/products/product-list.svg`;

  const PageViewChartOptions: ApexCharts.ApexOptions = {
    legend: { position: 'top', horizontalAlign: 'right' },
    xaxis: {
      categories: pageViewSeries?.map((item: Record<string, any>) => item.date),
    },
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#FFC107'],
  };
  const RequestClicksChartOptions: ApexCharts.ApexOptions = {
    legend: { position: 'top', horizontalAlign: 'right' },
    xaxis: {
      categories: requestClicksSeries?.map((item: Record<string, any>) => item.date),
    },
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#39AB97'],
  };
  const [errorMsg, setErrorMsg] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: yupResolver(loginFormSchema),
  });
  const requestName = useWatch({
    control,
    name: 'name', // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    defaultValue: '', // default value before the render
  });
  const requestDescription = useWatch({
    control,
    name: 'description', // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    defaultValue: '', // default value before the render
  });

  async function onSubmit({ name, description, url, message, subject, price }: FormValues) {
    if (slug) {
      setLoading(true);
      const { data } = await createRequest({
        variables: {
          data: {
            name,
            description,
            url,
            currencyCode: currency,
            message,
            subject,
            requestStatus: 'pending',
            price,
            applicationFee: price * 0.02,
            total: price - price * 0.02,
            days: 7,
            customer: {
              connect: {
                id: customer.id,
              },
            },
            imageObj: {
              url: image?.url,
            },
            // acceptBefore,
            page: {
              connect: {
                slug,
              },
            },
          },
        },
      });
      if (data?.createOneRequest) {
        setRequest(data?.createOneRequest);
      }
      setLoading(false);
    }
  }

  const calculateCountDown = (request) => {
    let expiredDate = new Date(request.expiredAt);
    let now = new Date();
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (expiredDate) {
      const expiredTimestamp = expiredDate.getTime();
      const nowTimestamp = now.getTime();
      const countDownSeconds = Math.floor((expiredTimestamp - nowTimestamp) / 1000);
      if (countDownSeconds > 60) {
        const countDownMinutes = Math.floor(countDownSeconds / 60);
        seconds = countDownSeconds % 60;
        if (countDownMinutes > 0) {
          minutes = countDownMinutes % 60;
          hours = Math.floor(countDownMinutes / 60);
        }
      }
    }
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="bg-gray-50 mt-[84px]">
      <Grid container className="md:px-4">
        <Grid item xs={12} md={6} className="py-5 px-4">
          <div className="text-xl font-bold mb-2">{tRequest('request-analytics-title')}</div>
          <div className="text-sm text-gray-800 mb-2">{tRequest('request-analytics-description')}</div>
          <Card
            className="mb-6 p-6"
            style={{
              border: '1px solid rgb(233 233 233)',
              borderRadius: '14px',
              boxShadow: 'rgb(165 165 165 / 10%) 0px 0px 10px',
            }}
          >
            <div className="text-xl font-bold mb-2">{tRequest('request-analytics-visit-title')}</div>
            <ReactApexChart
              type="area"
              series={[
                {
                  name: 'PageView',
                  data: pageViewSeries?.map((pageView: Record<string, any>) => pageView.amount),
                },
              ]}
              options={PageViewChartOptions}
              height={364}
              width={'90%'}
            />
          </Card>
          <Card
            className="mb-6 p-6"
            style={{
              border: '1px solid rgb(233 233 233)',
              borderRadius: '14px',
              boxShadow: 'rgb(165 165 165 / 10%) 0px 0px 10px',
            }}
          >
            <div className="text-xl font-bold mb-2">{tRequest('request-analytics-click-title')}</div>
            <ReactApexChart
              type="area"
              series={[
                {
                  name: 'PageView',
                  data: requestClicksSeries?.map((requestClicks: Record<string, any>) => requestClicks.amount),
                },
              ]}
              options={RequestClicksChartOptions}
              height={364}
              width={'90%'}
            />
          </Card>
          <Card
            className="mb-6 p-6"
            style={{
              border: '1px solid rgb(233 233 233)',
              borderRadius: '14px',
              boxShadow: 'rgb(165 165 165 / 10%) 0px 0px 10px',
            }}
          >
            <div className="text-xl font-bold mb-2">{tRequest('request-active')}</div>
            {page?.requests.length ? (
              <>
                {page?.requests?.filter((request) => {
                  const expiredAtTime = new Date(request.expiredAt).getTime()
                  const currentTime = new Date().getTime()
                  if (expiredAtTime > currentTime) {
                    return true
                  } else {
                    return false
                  }
                }).map((request: Record<string, any>) => {
                  return (
                    <div key={request.id} className="item-block py-4 flex align-items-cneter">
                      <div className="flex justify-center rounded-xl overflow-hidden">
                        <Image
                          src={request.image?.url! ?? placeholderImage}
                          alt={request.name}
                          layout="fixed"
                          width={60}
                          height={60}
                          className="product-image"
                          loader={({ src }) => { return src }}
                        />
                      </div>
                      <div className="ml-4 flex flex-col justify-center">
                        <div className="text-sm text-gray-500">
                          <span className="uppercase">{request.currencyCode}</span>
                          <span className="ml-1">{request.price}
                            {website?.paymentMethod === 'cryoto' ? website?.chain?.iconUrl ? <img src={website?.chain?.iconUrl} alt={website?.chain?.name} /> : website?.chain?.name : website?.currencyCode ? website?.currencyCode : 'usd'}
                          </span>
                          <span>
                            {website?.paymentMethod === 'cryoto' ? website?.chain?.iconUrl ? <img src={website?.chain?.iconUrl} alt={website?.chain?.name} /> : website?.chain?.name : website?.currencyCode ? website?.currencyCode : 'usd'}
                          </span>
                          <span className="ml-1">{`( ${tRequest('request-active-countdown')} ${calculateCountDown(
                            request,
                          )} )`}</span>
                        </div>
                        <div>{request.name}</div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-sm text-center my-14">
                {tRequest('request-available-one')}
                <br />
                {tRequest('request-available-two')}
              </div>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6} className="py-5 px-4">
          <div className="text-xl font-bold mb-2">{tRequest('request-invitation-form-title')}</div>
          <div className="text-sm text-gray-800 mb-2">
            {tRequest('request-invitation-form-description')}
            <MuiButton style={{ color: '#4B5971', paddingTop: 0, paddingBottom: 0, textDecoration: 'underline' }}>
              <img className="cursor-pointer inline align-middle" width={14} src="/icons/information.png" />
              <span className="ml-1 inline align-middle">{tRequest('request-invitation-form-introduction')}</span>
            </MuiButton>
          </div>
          <Card
            className="mb-6 p-6"
            style={{
              border: '1px solid rgb(233 233 233)',
              borderRadius: '14px',
              boxShadow: 'rgb(165 165 165 / 10%) 0px 0px 10px',
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {errorMsg && (
                <>
                  {/* <Alert
                  variant="error"
                  message={t(errorMsg)}
                  className="mb-6"
                  closeable={true}
                  onClose={() => setErrorMsg('')}
                /> */}
                  <div className="flex flex-col justify-center px-10 pt-4">
                    <Image src="/apply-fail.svg" alt={t('apply')} width={110} height={110} />
                    <div className="text-sm sm:text-base text-body text-center mt-10 mb-6" style={{ color: '#CB6767' }}>
                      {tRequest('request-invitation-form-fail')}
                    </div>
                    <div className="text-center">
                      <MuiButton type="submit" style={{ color: '#212B36' }} onClick={() => setErrorMsg('')}>
                        <span className="underline">{tRequest('request-invitation-form-try-again')}</span>
                      </MuiButton>
                    </div>
                  </div>
                </>
              )}

              {!!request ? (
                <div className="flex flex-col justify-center px-10 pt-4">
                  <Image src="/apply-sucess.svg" alt={t('apply')} width={110} height={110} />
                  <div className="text-sm sm:text-base text-body text-center mt-10 mb-6" style={{ color: '#32A08D' }}>
                    {tRequest('request-invitation-form-success')}
                  </div>
                </div>
              ) : (
                <>
                  <Input
                    label={t('text-request-page')}
                    name="page"
                    type="text"
                    variant="outline"
                    className="mb-5"
                    value={page?.name}
                    disabled
                  />
                  <Input
                    label={tRequest('request-label-subject')}
                    {...register('subject')}
                    type="text"
                    variant="outline"
                    className="mb-5"
                    error={t(errors.subject?.message!)}
                  />
                  <Input
                    label={tRequest('request-label-message')}
                    {...register('message')}
                    type="text"
                    variant="outline"
                    className="mb-5"
                    error={t(errors.message?.message!)}
                  />
                  <Input
                    name="days"
                    label={tRequest('request-label-days')}
                    type="number"
                    variant="outline"
                    className="mb-5"
                    value={7}
                    disabled
                  />
                  <Input
                    label={tRequest('request-label-price')}
                    {...register('price')}
                    type="number"
                    variant="outline"
                    className="mb-5"
                    error={t(errors.price?.message!)}
                  />
                  {/* <Input
                    label={tRequest('request-label-accept-before')}
                    {...register('acceptBefore')}
                    type="date"
                    variant="outline"
                    className="mb-5"
                    error={t(errors.acceptBefore?.message!)}
                  /> */}
                  {image ? (
                    <img src={image?.url} />
                  ) : (
                    <Upload
                      attachmentType={'image'}
                      maxFileSize={10000000000}
                      autoProceed={false}
                      maxNumberOfFiles={1}
                      onComplete={(newFile: Array<any>) => setImage(newFile[0])}
                    />
                  )}
                  <Input
                    label={tRequest('request-label-name')}
                    {...register('name')}
                    type="text"
                    variant="outline"
                    className="my-5"
                    error={t(errors.name?.message!)}
                  />
                  <Input
                    label={tRequest('request-label-description')}
                    {...register('description')}
                    type="text"
                    variant="outline"
                    className="mb-5"
                    error={t(errors.description?.message!)}
                  />
                  <Input
                    label={tRequest('request-label-url')}
                    {...register('url')}
                    type="text"
                    variant="outline"
                    className="mb-5"
                    error={t(errors.url?.message!)}
                  />
                  <label className="block text-body-dark font-semibold text-sm leading-none mb-3">
                    {tRequest('request-invitation-form-preview')}
                  </label>
                  <div className="relative" style={{ width: 260, height: 170, margin: 'auto' }}>
                    <Image
                      src={image?.url ?? placeholderImage}
                      layout={'fill'}
                      quality={100}
                      loader={({ src }) => { return src }}
                      alt={requestName || 'Request Image'}
                      className="bg-gray-300 object-cover transition duration-200 ease-linear transform group-hover:scale-105 rounded-[8px]"
                    />
                    <div className="absolute top-0 right-0 bottom-0 left-0 text-white p-4 flex flex-col">
                      <div className="flex justify-between items-center text-lg">
                        <span>{requestName}</span>
                        <ArrowNextIcon />
                      </div>
                      <div className="overflow-hidden break-all">{requestDescription}</div>
                    </div>
                  </div>
                  <Button
                    className="w-full h-11 mt-8 sm:h-12"
                    loading={loading}
                    disabled={loading}
                  >
                    {tRequest('request-invitation-form-request')}
                  </Button>
                </>
              )}
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const cookies = parseContextCookie(context?.req?.headers?.cookie);
  const websiteSlug = context.req.headers.host.split('.')[0];

  if (!cookies?.magic_token) {
    return { redirect: { destination: '/', permanent: false } };
  }

  const page = await prisma.page.findUnique({
    where: {
      slug: context?.query?.pageSlug,
    },
    select: {
      id: true,
      slug: true,
      isIndex: true,
      name: true,
      imageObj: true,
      website: true,
      pageViews: true,
      requestClicks: true,
      requests: true,
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

  return {
    props: {
      website: processWebsite(website),
      page: processPage(page),
      ...(await serverSideTranslations(context.locale, ['common', 'request'])),
    },
  };
};
