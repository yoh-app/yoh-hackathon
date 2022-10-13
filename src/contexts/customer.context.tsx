import { useRouter } from 'next/router';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useFindManyCustomerQuery, useCreateOneCustomerMutation, useUpdateOneCustomerMutation, useGetCustomerQuery } from '../generated';
import { useSettings } from './settings.context';
import { useAuth } from 'admin/src/magic/components/AuthProvider';
import { useAccount } from 'wagmi';
const initialState = {};

export const CustomerContext = React.createContext(initialState);

CustomerContext.displayName = 'CustomerContext';

export const CustomerProvider: FC = (props) => {
  const { websiteSlug } = useSettings();

  const { user } = useAuth();

  const { data } = useGetCustomerQuery({
    variables: {
      websiteSlug
    },
    skip: !user?.id || !websiteSlug,
  })

  return (
    <CustomerContext.Provider
      value={{
        customer: data?.getCustomer,
      }}
      {...props}
    />
  );
};

export const useCustomer = () => {
  const context = React.useContext(CustomerContext);
  if (context === undefined) {
    throw new Error(`useCustomer must be used within a CustomerProvider`);
  }
  return context;
};
