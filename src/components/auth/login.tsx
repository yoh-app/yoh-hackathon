import { useState } from 'react';
import dynamic from 'next/dynamic';
// const DynamicModalContainer = dynamic(() => import('admin/src/magic/components/Modal/ModalContainer'));
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import prisma from 'admin/src/server/context/prisma';
import processPage from '@process/page';
import Input from '@components/ui/input';
import Button from '@components/ui/button';
import { useForm } from 'react-hook-form';
import { useApolloClient } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useLogoutMutation } from '@generated';
import { useAuth } from 'admin/src/magic/components/AuthProvider';
import { useUI } from '@contexts/ui.context';
import MuiInput from '@mui/material/Input';
import MuiButton from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import processWebsite from '@process/website';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSettings } from '@contexts/settings.context';

type FormValues = {
  email: string;
  code: string;
};

const loginFormSchema = yup.object().shape({
  email: yup.string().email('error-email-format').required('Email is required'),
  code: yup.string().required('Email verification code is required'),
});

export default function Login() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const client = useApolloClient();
  const website = useSettings()
  const { actions, isLoading, isAuthenticated } = useAuth();
  const [logout] = useLogoutMutation();
  const { authorize } = useUI();
  const {
    reset,
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(loginFormSchema),
  });
  const [isSend, setIsSend] = useState(false);

  async function onSubmit({ email, code }: FormValues) {
    await logout();
    localStorage.removeItem('accessToken');

    client.resetStore();
    const result = await actions.login(email, code);
    if (!result.error) {
      await actions.completeLogin();
    }
  }

  const onRequestVerificationCode = async () => {
    trigger('email').then(async (status) => {
      if (status) {
        try {
          const result = await actions.verify(getValues('email'));
          if (!result.error) {
            setIsSend(true);
          }
        } catch (error) {
          console.error(error);
          reset();
          // if (isMountedRef.current) {
          //   setError('afterSubmit', error);
          // }
        }
      }
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      authorize();
      window.location.reload()
      // router.push('/');
    }
  }, [isAuthenticated]);

  return (
    <div className="py-6 px-5 sm:p-8 bg-light w-screen md:max-w-[480px] min-h-screen md:min-h-0 h-full md:h-auto flex flex-col justify-center">


      {/* <div className="absolute md:left-0 md:top-0 p-10 inset-x-0 bottom-0 md:bottom-auto text-center md:text-left justify-center flex md:block">
        <img src="/new-logo.svg" />
      </div>
      <div className="absolute right-0 top-0 p-10 w-[300px] text-right text-white">
        <Image src="/login-bg-ellipse.svg" layout="fill" objectFit="contain" objectPosition="right top" />
        <span className="text-[30px] leading-none relative">{t('profile-sidebar-login')}</span>
      </div> */}
      <div className="text-center min-w-[300px]">
        <div className="text-[#4B5971] text-[28px] leading-none my-7">
          {t('profile-sidebar-welcome')} <span className="text-[#4e44b7]">{website?.name}</span>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <MuiInput
            {...register('email')}
            type="email"
            dimension="small"
            variant="outline"
            className="mt-9"
            placeholder="example@yoh.app"
            error={t(errors.email?.message!)}
            type="text"
            className="mt-9 w-full normal-case"
            placeholder={t('placeholder-verification-code')}
            error={t(errors.code?.message!)}
            sx={{
              border: '1px solid',
              background: '#ffffff',
              padding: '2px 12px',
              borderRadius: '10px',
              fontSize: '16px',
              lineHeight: 1,
              '&:not(.Mui-disabled):before': {
                borderBottom: 'none',
              },
              '&:after': {
                border: 'none',
              },
              '&:hover:not(.Mui-disabled):before': {
                borderBottom: 'none',
              },
            }}
          />
          <MuiInput
            {...register('code')}
            type="text"
            className="mt-9 w-full normal-case"
            placeholder={t('placeholder-verification-code')}
            error={t(errors.code?.message!)}
            sx={{
              border: '1px solid',
              background: '#ffffff',
              padding: '2px 12px',
              borderRadius: '10px',
              fontSize: '16px',
              lineHeight: 1,
              '&:not(.Mui-disabled):before': {
                borderBottom: 'none',
              },
              '&:after': {
                border: 'none',
              },
              '&:hover:not(.Mui-disabled):before': {
                borderBottom: 'none',
              },
            }}
            endAdornment={
              <InputAdornment position="end">
                <MuiButton
                  variant="text"
                  sx={{
                    color: '#6851FF',
                    background: 'trnasparent',
                    textTransform: 'none',
                  }}
                  onClick={onRequestVerificationCode}
                >
                  {t('text-verify')}
                </MuiButton>
              </InputAdornment>
            }
          />
          {isSend ? <p className="text-[#6851FF] text-[14px]">{t('text-verification-code')}</p> : []}
          <div className="mt-9">
            <Button
              className="py-2 px-9"
              // style={{ background: '#6851FF' }}
              size="small"
              loading={isLoading}
              disabled={isLoading}
            >
              {t('text-login')}
            </Button>
          </div>
        </form>
      </div>
      {/* <DynamicModalContainer /> */}
    </div>
  );
}