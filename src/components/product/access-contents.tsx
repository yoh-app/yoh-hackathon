import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useSettings } from '@contexts/settings.context';
import { Grid } from '@mui/material';
import Iconify from 'admin/src/components/Iconify';

import { themes } from '@themes/index';
import { GraphQLClient } from 'graphql-request';
import { Network, Alchemy } from "alchemy-sdk";
const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY, // Replace with your Alchemy API Key.
  network: Network.MATIC_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

const graphqlRequest = async (query, variables) => {
  const accessToken = localStorage.getItem('accessToken');
  const graphQLClient = new GraphQLClient('https://api.zora.co/graphql');
  const result = await graphQLClient.request(query, variables);
  return result;
};


type Props = {
  product: any;
  variant?: 'defaultView' | 'modalView';
};

const ProductDetails: React.FC<Props> = ({ view, setView, productData }) => {
  const { themeColor, currency, slug: websiteSlug, id, walletAddress } = useSettings();
  const { t } = useTranslation('common');

  return (

    <div className="p-6 lg:px-8">
      {productData?.audios ? (
        <>
          <div
            className="flex items-center text-[20px] font-bold mt-[60px] mb-[24px] gap-x-2"
            style={{ color: themes[themeColor].accent900 }}
          >
            <Iconify
              icon={'lucide:headphones'}
              className="rounded-full text-white p-1"
              style={{ background: themes[themeColor].accent900 }}
            />
            <span className="text-[#4B5971]">{t('text-audio')}</span>
          </div>
          <Grid container rowSpacing={3} columnSpacing={3}>
            {productData?.audios.map((item) => {
              return (
                <Grid item xs={12} sm={6} md={3}>
                  <div
                    className="relative rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setView({ ...item, type: 'audio', status: 'purchased' })}
                  >
                    <Image
                      src={item?.imageObj.url ?? '/product-placeholder.svg'}
                      width="100%"
                      height="125%"
                      layout="responsive"
                      objectFit="cover"
                      alt={item?.name}
                      loader={({ src }) => { return src }}
                    />
                    <div
                      className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center"
                      style={{ background: 'rgba(0, 0, 0, 0.34)' }}
                    >
                      <div
                        className="border border-white text-white rounded-full w-[44px] h-[44px] flex items-center justify-center text-[24px]"
                        style={{ background: 'rgba(0, 0, 0, 0.54)' }}
                      >
                        <Iconify icon={'icon-park-outline:waves'} />
                      </div>
                    </div>
                    <div className="absolute bottom-[20px] left-[20px] text-white text-[22px]">{item.name}</div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        []
      )}
      {productData?.videos ? (
        <>
          <div
            className="flex items-center text-[20px] font-bold mt-[60px] mb-[24px] gap-x-2"
            style={{ color: themes[themeColor].accent900 }}
          >
            <Iconify
              icon={'icon-park-outline:film'}
              className="rounded-full text-white p-1"
              style={{ background: themes[themeColor].accent900 }}
            />
            <span className="text-[#4B5971]">{t('text-video')}</span>
          </div>
          <Grid container rowSpacing={3} columnSpacing={3}>
            {productData?.videos.map((item) => {
              return (
                <Grid item xs={12} sm={6} md={3}>
                  <div
                    className="relative rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setView({ ...item, type: 'video', status: 'purchased' })}
                  >
                    <Image
                      src={item?.imageObj.url ?? '/product-placeholder.svg'}
                      width="100%"
                      height="70%"
                      layout="responsive"
                      objectFit="cover"
                      alt={item?.name}
                      loader={({ src }) => { return src }}
                    />
                    <div
                      className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center"
                      style={{ background: 'rgba(0, 0, 0, 0.34)' }}
                    >
                      <div
                        className="border border-white text-white rounded-full w-[44px] h-[44px] flex items-center justify-center text-[24px]"
                        style={{ background: 'rgba(0, 0, 0, 0.54)' }}
                      >
                        <Iconify icon={'fluent:play-32-regular'} />
                      </div>
                    </div>
                    <div className="absolute bottom-[20px] left-[20px] text-white text-[22px]">{item.name}</div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        []
      )}
      {productData?.documents ? (
        <>
          <div
            className="flex items-center text-[20px] font-bold mt-[60px] mb-[24px] gap-x-2"
            style={{ color: themes[themeColor].accent900 }}
          >
            <Iconify
              icon={'ph:link-simple-bold'}
              className="rounded-full text-white p-1"
              style={{ background: themes[themeColor].accent900 }}
            />
            <span className="text-[#4B5971]">{t('text-document')}</span>
          </div>
          <Grid container rowSpacing={3} columnSpacing={3}>
            {productData?.documents.map((item) => {
              return (
                <Grid item xs={12} sm={6} md={3}>
                  <a target='_blank' href={item.documentObj.url}>
                    <div
                      className="relative pb-[30px] cursor-pointer"
                    >
                      <div className="relative rounded-xl overflow-hidden">
                        <Image
                          src={item?.imageObj.url ?? '/product-placeholder.svg'}
                          width="100%"
                          height="70%"
                          layout="responsive"
                          objectFit="cover"
                          alt={item?.name}
                          loader={({ src }) => { return src }}
                        />
                        <div
                          className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center"
                          style={{ background: 'rgba(0, 0, 0, 0.34)' }}
                        />
                      </div>
                      <div
                        className="absolute bottom-0 left-0 p-[20px] w-[90%] text-[#212B36] bg-white text-[22px] rounded-lg rounded-tl-none"
                        style={{ boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.05)' }}
                      >
                        {item.name}
                      </div>
                    </div>
                  </a>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        []
      )}
      {productData?.links ? (
        <>
          <div
            className="flex items-center text-[20px] font-bold mt-[60px] mb-[24px] gap-x-2"
            style={{ color: themes[themeColor].accent900 }}
          >
            <Iconify
              icon={'ph:link-simple-bold'}
              className="rounded-full text-white p-1"
              style={{ background: themes[themeColor].accent900 }}
            />
            <span className="text-[#4B5971]">{t('text-link')}</span>
          </div>
          <Grid container rowSpacing={3} columnSpacing={3}>
            {productData?.links.map((item) => {
              return (
                <Grid item xs={12} sm={6} md={3}>
                  <div
                    className="relative pb-[30px] cursor-pointer"
                    onClick={() => setView({ ...item, type: 'link', status: 'purchased' })}
                  >
                    <div className="relative rounded-xl overflow-hidden">
                      <Image
                        src={item?.imageObj.url ?? '/product-placeholder.svg'}
                        width="100%"
                        height="70%"
                        layout="responsive"
                        objectFit="cover"
                        alt={item?.name}
                        loader={({ src }) => { return src }}
                      />
                      <div
                        className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center"
                        style={{ background: 'rgba(0, 0, 0, 0.34)' }}
                      />
                      {item.hiddenMessage ? (
                        <div
                          className="absolute top-[16px] left-[16px] rounded-[12px] py-1 px-3 text-[12px]"
                          style={{
                            backgroundColor: themes[themeColor].accent50,
                            color: themes[themeColor].accent900,
                          }}
                        >
                          {item.hiddenMessage}
                        </div>
                      ) : (
                        []
                      )}
                    </div>
                    <div
                      className="absolute bottom-0 left-0 p-[20px] w-[90%] text-[#212B36] bg-white text-[22px] rounded-lg rounded-tl-none"
                      style={{ boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.05)' }}
                    >
                      {item.name}
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        []
      )}

      {productData?.pictures ? (
        <>
          <div
            className="flex items-center text-[20px] font-bold mt-[60px] mb-[24px] gap-x-2"
            style={{ color: themes[themeColor].accent900 }}
          >
            <Iconify
              icon={'ph:link-simple-bold'}
              className="rounded-full text-white p-1"
              style={{ background: themes[themeColor].accent900 }}
            />
            <span className="text-[#4B5971]">{t('text-picture')}</span>
          </div>
          <Grid container rowSpacing={3} columnSpacing={3}>
            {productData?.pictures?.map((item) => {
              return (
                <Grid item xs={12} sm={6} md={3}>
                  <div
                    className="relative pb-[30px] cursor-pointer"
                  >
                    <div className="relative rounded-xl overflow-hidden">
                      <Image
                        src={item?.imageObj.url ?? '/product-placeholder.svg'}
                        width="100%"
                        height="70%"
                        layout="responsive"
                        objectFit="cover"
                        alt={item?.name}
                        loader={({ src }) => { return src }}
                      />
                      <div
                        className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center"
                        style={{ background: 'rgba(0, 0, 0, 0.34)' }}
                      />
                    </div>
                    <div
                      className="absolute bottom-0 left-0 p-[20px] w-[90%] text-[#212B36] bg-white text-[22px] rounded-lg rounded-tl-none"
                      style={{ boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.05)' }}
                    >
                      {item.name}
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        []
      )}
    </div>

  );
};

export default ProductDetails;
