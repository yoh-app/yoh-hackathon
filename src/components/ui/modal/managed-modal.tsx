import dynamic from 'next/dynamic';
import Modal from '@components/ui/modal/modal';
import { useModalAction, useModalState } from './modal.context';
import ShopProfileCard from '@components/profile/profile-card';
import OtpLoginView from '@components/auth/mobile-otp-login/otp-view';
const Login = dynamic(() => import('@components/auth/login'));
const Magic = dynamic(() => import('@components/auth/magic'));
const Request = dynamic(() => import('@components/request/request-form'));

const Register = dynamic(() => import('@components/auth/register'));
const ForgotPassword = dynamic(() => import('@components/auth/forget-password/forget-password'));
const ProductDetailsModalView = dynamic(() => import('@components/product/product-details-modal-view'));
const CardDetailsModalView = dynamic(() => import('@components/collection/card-details-modal-view'));
const CreateOrUpdateAddressForm = dynamic(() => import('@components/address/address-form'));
const AddressDeleteView = dynamic(() => import('@components/address/address-delete-view'));

const ManagedModal = () => {
  const { isOpen, view, data } = useModalState();
  const { closeModal } = useModalAction();

  return (
    <Modal open={isOpen} onClose={closeModal}>
      {view === 'REQUEST_VIEW' && <Request />}
      {view === 'LOGIN_VIEW' && <Login />}
      {view === 'MAGIC_VIEW' && <Magic />}
      {view === 'REGISTER' && <Register />}
      {view === 'FORGOT_VIEW' && <ForgotPassword />}
      {view === 'OTP_LOGIN' && <OtpLoginView />}
      {view === 'ADD_OR_UPDATE_ADDRESS' && <CreateOrUpdateAddressForm />}
      {view === 'DELETE_ADDRESS' && <AddressDeleteView />}
      {view === 'CARD_DETAILS' && <CardDetailsModalView card={data} />}
      {view === 'PRODUCT_DETAILS' && <ProductDetailsModalView productSlug={data} />}
      {view === 'SHOP_INFO' && (
        <ShopProfileCard
          data={data}
          cardClassName="!hidden"
          className="!flex flex-col !w-screen !h-screen !rounded-none"
        />
      )}
    </Modal>
  );
};

export default ManagedModal;
