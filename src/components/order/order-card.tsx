import { useState } from 'react';
import usePrice from '@utils/use-price';
import dayjs from 'dayjs';
import { Button, Card, Chip, Collapse } from '@mui/material';
import { useTranslation } from 'next-i18next';
import OrderItems from './order-items';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import Link from 'next/link';
import { useSettings } from '@contexts/settings.context';

type OrderCardProps = {
  order: any;
  isActive: boolean;
  onClick?: (e: any) => void;
};

const chipColorMap: Record<string, any> = {
  'pending': {
    color: '#CB6767',
    backgroundColor: 'rgba(203, 103, 103, 0.16)'
  },
  'processing': {
    color: '#AB5BBF',
    backgroundColor: 'rgba(171, 91, 191, 0.16)'
  },
  'completed': {
    color: '#39AB97',
    backgroundColor: 'rgba(57, 171, 151, 0.16)'
  },
}

const OrderCard: React.FC<OrderCardProps> = ({ onClick, order, isActive }) => {
  const { t } = useTranslation('common');
  const { t: tOrder } = useTranslation('order');
  const [open, setOpen] = useState(false);
  const website = useSettings()

  const { id, orderStatus, createdAt } = order;
  // const { price: total } = usePrice({
  //   amount: order?.total,
  // });

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card className="mb-5 p-4" style={{ border: `1px solid ${isActive ? '#FFC107' : '#EAE6D9'}`, borderRadius: '14px', boxShadow: '0px 0px 10px rgba(152, 121, 29, 0.1)' }}>
        <div className="flex justify-between items-center mb-2 md:mb-5">
          <span className="flex font-bold text-sm lg:text-base text-heading me-4 flex-shrink-0">
            {t('text-order')}
            <span className="font-normal">#&nbsp;{id}</span>
          </span>
          <Chip sx={{ display: { xs: 'none', md: 'flex' } }} label={t(`text-${orderStatus}`)} size="small" style={{ borderRadius: "6px", ...chipColorMap[orderStatus] }} />
        </div>
        <Chip sx={{ display: { xs: 'inline-flex', md: 'none' } }} className="mb-3" label={t(`text-${orderStatus}`)} size="small" style={{ borderRadius: "6px", ...chipColorMap[orderStatus] }} />
        <div className="flex justify-between items-center py-[6px] px-3 bg-gray-100 rounded-lg mb-3">
          <span className="overflow-hidden flex-shrink-0">{t('text-order-date')}</span>
          <span className="ms-1">{dayjs(createdAt).format('MMMM D, YYYY')}</span>
        </div>
        <div className="flex justify-between items-center py-[6px] px-3 bg-amber-50 rounded-lg mb-2">
          <span className="overflow-hidden flex-shrink-0">{t('text-total-price')}</span>
          <span className="ms-1">{order?.amount}</span>
        </div>
        <Collapse className="lg:hidden" in={open} timeout="auto" unmountOnExit>
          <div>
            {/* <div className="text-sm text-gray-800 mt-3 mb-2">{tOrder('order-detail-description')}</div>
            <div className="flex justify-between items-center py-[6px] px-3 bg-gray-100 rounded-lg mb-3">
              <span className="overflow-hidden flex-shrink-0">{t('text-sub-total')}</span>
              <span className="ms-1">{order.amount}</span>
            </div>
            {
              order.coupon?.name ?
                (
                  <div className="flex justify-between items-center py-[6px] px-3 bg-gray-100 rounded-lg mb-3">
                    <span className="overflow-hidden flex-shrink-0">{`${t('text-coupon')} - (${order.coupon?.name}${order.coupon?.couponType === 'percent_off' ? `: ${order?.coupon?.percent_off} %` : ''})`}</span>
                    <span className="ms-1">{order.coupon?.couponType === 'amount_off' ? order.amount_off : order.percent_off}</span>
                  </div>
                ) : []
            }
            <div className="flex justify-between items-center py-[6px] px-3 bg-amber-50 rounded-lg">
              <span className="overflow-hidden flex-shrink-0">{t('text-total')}</span>
              <span className="ms-1">{order?.total}</span>
            </div> */}
            <div className="mt-4 mb-3 font-bold">{t('text-product')}</div>
            {website?.paymentMethod === 'crypto' && <div className="flex justify-between items-center py-[6px] px-3 bg-amber-50 rounded-lg">
              <span className="overflow-hidden flex-shrink-0">{t('wallet-address')}</span>
              <span className="ms-1">{order?.walletAddress}</span>
            </div>}
            {website?.paymentMethod === 'crypto' && <div className="flex justify-between items-center py-[6px] px-3 bg-amber-50 rounded-lg my-3">
              <span className="overflow-hidden flex-shrink-0">{t('transaction-hash')}</span>
              <span className="ms-1">{order?.transactionHash}</span>
            </div>}
            {
              order?.orderedProducts.map((item, index) => {
                return (
                  <Link href={`/products/${item.product.slug}`}>
                    <a>
                      <div key={index} className="bg-gray-100 py-[6px] px-3 rounded-lg mb-3">
                        <div className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{`${item.price}`}</span>
                          {order?.website?.paymentMethod === 'cryoto' ? order?.website?.chain?.iconUrl ? <img src={order?.website?.chain?.iconUrl} alt={order?.website?.chain?.name} /> : order?.website?.chain?.name : order?.website?.currencyCode ? order?.website?.currencyCode : 'usd'}

                        </div>
                        <OrderItems list={item.orderedAudios} type="audio" />
                        <OrderItems list={item.orderedLinks} type="link" />
                        <OrderItems list={item.orderedVideos} type="video" />
                      </div>
                    </a>
                  </Link>
                )
              })
            }
          </div>
        </Collapse>
        <Button sx={{ display: { lg: 'none' } }} onClick={handleClick} fullWidth style={{ color: '#B8B8B8' }}>
          {
            open ? (
              <IoIosArrowUp />
            ) : (
              <IoIosArrowDown />
            )
          }
        </Button>
      </Card>
    </div>
  );
};

export default OrderCard;
