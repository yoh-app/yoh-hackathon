import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useSettings } from '@contexts/settings.context';
import Iconify from 'admin/src/components/Iconify';
import { themes } from '@themes/index';

type Props = {
  product: any;
  variant?: 'defaultView' | 'modalView';
};

const ProductDetails: React.FC<Props> = ({ product, setView }) => {
  const { themeColor, currency, slug: websiteSlug, id, walletAddress } = useSettings();
  const { t } = useTranslation('common');

  return (
    <>
      <div
        className="flex items-center text-[20px] font-bold mt-[60px] gap-y-2"
        style={{ color: themes[themeColor].accent900 }}
      >
        <Iconify icon={'lucide:package'} />
        <span>{t('text-contents')}</span>
      </div>
      <div className="flex flex-col gap-y-4 mt-4">
        {product?.videos?.map((item) => {
          return (
            <div
              className="flex border-b border-[#EBEBEB] pb-4 gap-x-4 cursor-pointer"
              onClick={() => setView({ ...item, type: 'video', status: 'unpurchased' })}
            >
              <div className="h-[62px] w-[62px]">
                <Image
                  className="rounded-xl"
                  src={item?.imageObj.url ?? '/product-placeholder.svg'}
                  alt={item?.name!}
                  width="100%"
                  height="100%"
                  layout="responsive"
                  objectFit="cover"
                  loader={({ src }) => { return src }}
                />
              </div>
              <div>
                <div className="flex items-center text-[14px] gap-x-1 text-[#637381]">
                  <Iconify icon={'icon-park-outline:film'} />
                  <span>{t('text-video')}</span>
                </div>
                <div>{item.name}</div>
              </div>
            </div>
          );
        })}
        {product?.links?.map((item) => {
          return (
            <div
              className="flex border-b border-[#EBEBEB] pb-4 gap-x-4 cursor-pointer"
              onClick={() => setView({ ...item, type: 'link', status: 'unpurchased' })}
            >
              <div className="h-[62px] w-[62px]">
                <Image
                  className="rounded-xl"
                  src={item?.imageObj.url ?? '/product-placeholder.svg'}
                  alt={item?.name}
                  width="100%"
                  height="100%"
                  layout="responsive"
                  objectFit="cover"
                  loader={({ src }) => { return src }}
                />
              </div>
              <div>
                <div className="flex items-center text-[14px] gap-x-1 text-[#637381]">
                  <Iconify icon={'ph:link-simple-bold'} />
                  <span>{t('text-link')}</span>
                </div>
                <div>{item.name}</div>
              </div>
            </div>
          );
        })}
        {product?.audios?.map((item) => {
          return (
            <div
              className="flex border-b border-[#EBEBEB] pb-4 gap-x-4 cursor-pointer"
              onClick={() => setView({ ...item, type: 'audio', status: 'unpurchased' })}
            >
              <div className="h-[62px] w-[62px]">
                <Image
                  className="rounded-xl"
                  src={item?.imageObj.url ?? '/product-placeholder.svg'}
                  alt={item?.name}
                  width="100%"
                  height="100%"
                  layout="responsive"
                  objectFit="cover"
                  loader={({ src }) => { return src }}
                />
              </div>
              <div>
                <div className="flex items-center text-[14px] gap-x-1 text-[#637381]">
                  <Iconify icon={'lucide:headphones'} />
                  <span>{t('text-audio')}</span>
                </div>
                <div>{item.name}</div>
              </div>
            </div>
          );
        })}
        {product?.documents?.map((item) => {
          return (
            <div
              className="flex border-b border-[#EBEBEB] pb-4 gap-x-4 cursor-pointer"
              onClick={() => setView({ ...item, type: 'document', status: 'unpurchased' })}
            >
              <div className="h-[62px] w-[62px]">
                <Image
                  className="rounded-xl"
                  src={item?.imageObj.url ?? '/product-placeholder.svg'}
                  alt={item?.name}
                  width="100%"
                  height="100%"
                  layout="responsive"
                  objectFit="cover"
                  loader={({ src }) => { return src }}
                />
              </div>
              <div>
                <div className="flex items-center text-[14px] gap-x-1 text-[#637381]">
                  <Iconify icon={'lucide:file-text'} />
                  <span>{t('text-document')}</span>
                </div>
                <div>{item.name}</div>
              </div>
            </div>
          );
        })}
        {product?.pictures?.map((item) => {
          return (
            <div
              className="flex border-b border-[#EBEBEB] pb-4 gap-x-4 cursor-pointer"
              onClick={() => setView({ ...item, type: 'picture', status: 'unpurchased' })}
            >
              <div className="h-[62px] w-[62px]">
                <Image
                  className="rounded-xl"
                  src={item?.imageObj?.url ?? '/product-placeholder.svg'}
                  alt={item?.name}
                  width="100%"
                  height="100%"
                  layout="responsive"
                  objectFit="cover"
                  loader={({ src }) => { return src }}
                />
              </div>
              <div>
                <div className="flex items-center text-[14px] gap-x-1 text-[#637381]">
                  <Iconify icon={'lucide:image'} />
                  <span>{t('text-picture')}</span>
                </div>
                <div>{item.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductDetails;
