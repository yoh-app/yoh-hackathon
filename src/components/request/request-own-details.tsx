import { Card } from '@mui/material';
import Image from 'next/image';
import dayjs from 'dayjs';

import usePrice from '@utils/use-price';
import { useTranslation } from 'next-i18next';
import { useSettings } from '@contexts/settings.context';


interface Props {
  request: any;
}

const RequestOwnDetails = ({ request }: Props) => {
  const { t } = useTranslation('common');
  const { t: tRequest } = useTranslation('request');
  const { requestStatus, name, description, price, subject, url, page, message, days, expiredAt, imageObj, acceptBefore, walletAddress, transactionHash } = request ?? {};
  const website = useSettings()

  // const { price } = usePrice({
  //   amount: request?.price,
  // });

  return (
    <Card className="mb-5 p-4" style={{ border: '1px solid #EAE6D9', borderRadius: '14px', boxShadow: '0px 0px 10px rgba(152, 121, 29, 0.1)' }}>
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-status')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{tRequest(`request-label-status-${requestStatus}`)}</div>
      </div>
      {(website?.paymentMethod === 'crypto' && (requestStatus === 'active' || requestStatus === 'completed')) && <div className="mb-5">
        <div className="overflow-hidden mb-2">{t('wallet-address')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{walletAddress}</div>
      </div>}
      {(website?.paymentMethod === 'crypto' && (requestStatus === 'active' || requestStatus === 'completed')) && <div className="mb-5">
        <div className="overflow-hidden mb-2">{t('transaction-hash')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{transactionHash}</div>
      </div>}
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-subject')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{subject}</div>
      </div>
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-subject')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{subject}</div>
      </div>
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-message')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{message}</div>
      </div>
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-days')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{days}</div>
      </div>
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-price')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{price}</div>
      </div>
      {/* <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-accept-before')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{dayjs(acceptBefore).format('MMMM D, YYYY')}</div>
      </div> */}
      {(requestStatus === 'active ' || requestStatus === 'complete') && <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-expired')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{expiredAt ? dayjs(expiredAt).format('MMMM D, YYYY') : '-'}</div>
      </div>}
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-image')}</div>
        <div className="py-[6px] px-3 flex items-center justify-center">
          <Image
            src={imageObj?.url ?? '/product-placeholder.svg'}
            layout={"fixed"}
            quality={100}
            width={260}
            height={170}
            alt={name}
            loader={({ src }) => { return src }}
          />
        </div>
      </div>
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-name')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{name}</div>
      </div>
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-description')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{description}</div>
      </div>
      <div className="mb-5">
        <div className="overflow-hidden mb-2">{tRequest('request-label-url')}</div>
        <div className="bg-gray-100 rounded-lg py-[6px] px-3">{url}</div>
      </div>
    </Card>
  );
};

export default RequestOwnDetails;
