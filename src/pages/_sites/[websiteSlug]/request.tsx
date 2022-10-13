import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';
import prisma from 'admin/src/server/context/prisma';
import processWebsite from '@process/website';
import { useRouter } from 'next/router'
import { useContractWrite, usePrepareContractWrite, useAccount, useConnect } from 'wagmi';
import PaymentsAddress from '@web3/contractsData/Payments-address.json';
import PolygonPaymentAddress from '@web3/contractsData/polygon-Payments-address.json';
import KlaytnPaymentsAddress from '@web3/contractsData/klaytn-Payments-address.json';
import PolygonPaymentsAbi from '@web3/contractsData/polygon-Payments.json';
import KlaytnPaymentsAbi from '@web3/contractsData/klaytn-Payments.json';

import { useQuery, gql } from '@apollo/client'
import web3 from 'web3'
import axios from 'axios';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Grid, Button as MuiButton, Card } from '@mui/material';

import Input from '@components/ui/input';
import { usePrepareRequestMutation } from '@generated'
import Button from '@components/ui/button';
import { useCustomer } from '@contexts/customer.context';


import { useTranslation } from 'next-i18next';
import { InjectedConnector } from 'wagmi/connectors/injected';
import Link from 'next/link'
export default function Home() {
  const { t } = useTranslation('common');
  const { t: tRequest } = useTranslation('request');
  const [processingTransaction, setProcessingTransaction] = useState(false)
  const { query, push } = useRouter()
  const { address } = useAccount()
  const { customer } = useCustomer();
  const [usePrepareRequest] = usePrepareRequestMutation()
  const { data } = useQuery(gql`query findManyRequest(
    $where: RequestWhereInput
  ) {
    findManyRequest(where: $where) {
      id
      imageObj
      message
      name
      paid
      price
      subject
      description
      url
      requestStatus
      page {
        id
        slug
        name
        description
        imageObj
        website {
          id
          walletAddress
          name
          description
          imageObj
          chain
          paymentMethod
        }
      }
    }
  }
  `, {
    skip: !query?.requestId,
    variables: {
      where: {
        id: {
          equals: query?.requestId
        },
        active: {
          equals: true
        }
      }
    }
  })

  const request = data?.findManyRequest?.[0]
  console.log(request, 'request!')
  const { config: klaytnConfig } = usePrepareContractWrite({
    addressOrName: KlaytnPaymentsAddress.address,
    contractInterface: KlaytnPaymentsAbi.abi,
    functionName: 'payRequest',
    enabled: !!request?.page?.website?.chain?.name && !!request?.page?.website?.walletAddress && !!request?.price && !!request?.id,
    args: [
      request?.page?.website?.walletAddress,
      web3.utils.toWei(request?.price ? `${request?.price * 0.02}` : '0'),
      web3.utils.toWei(request?.price ? `${request?.price - request?.price * 0.02}` : '0'),
      request?.id,
      {
        gasLimit: 1300000,
        value:
          web3.utils.toWei(request?.price ? `${request?.price}` : '0')
      },
    ],
    onSettled(data, error) {
      console.log('Settled', { data, error });
    },
  });

  const { config: polygonConfig } = usePrepareContractWrite({
    addressOrName: PolygonPaymentAddress.address,
    contractInterface: KlaytnPaymentsAbi.abi,
    functionName: 'payRequest',
    enabled: !!request?.page?.website?.chain?.name && !!request?.page?.website?.walletAddress && !!request?.price && !!request?.id,
    args: [
      request?.page?.website?.walletAddress,
      web3.utils.toWei(request?.price ? `${request?.price * 0.02}` : '0'),
      web3.utils.toWei(request?.price ? `${request?.price - request?.price * 0.02}` : '0'),
      request?.id,
      {
        gasLimit: 1300000,
        value:
          web3.utils.toWei(request?.price ? `${request?.price}` : '0')
      },
    ],
    onSettled(data, error) {
      console.log('Settled', { data, error });
    },
  });

  const { connectAsync: connectToKlaytn } = useConnect({
    connector: new InjectedConnector(),
    chainId: 4,
    onSettled(data, error, variables, context) {
      console.log('connect to klaytn settled: ', data);
    },
  });
  const { connectAsync: connectToPolygon } = useConnect({
    connector: new InjectedConnector(),
    chainId: 137,
    onSettled(data, error, variables, context) {
      console.log('connect to mainnet settled: ', data);
    },
  });

  async function onSuccess(success) {
    console.log('Success', success);
    if (success?.hash) {
      console.log(success?.hash);
      const receipt = await success?.wait();
      console.log(receipt);

      await axios.post('/api/requestPaid', {
        transactionHash: success?.hash,
        requestId: query?.requestId,
        walletAddress: address
      });
      setProcessingTransaction(false)
      push(`/pages/${request?.page?.slug}`)
    }
  }

  const {
    data: klaytnContractData,
    isLoading: klaytnIsLoading,
    isSuccess: klaytnIsSuccess,
    write: klaytnWrite,
  } = useContractWrite({
    ...klaytnConfig,
    onError(error) {
      console.log('Error', error);
      setProcessingTransaction(false)
    },
    onSuccess,
    onMutate({ args, overrides }) {
      console.log('Mutate', { args, overrides });
    },
  });

  const {
    data: polygonContractData,
    isLoading: polygonIsLoading,
    isSuccess: polygonIsSuccess,
    write: polygonWrite,
  } = useContractWrite({
    ...polygonConfig,
    onError(error) {
      console.log('Error', error);
      setProcessingTransaction(false)
    },
    onSuccess,
    onMutate({ args, overrides }) {
      console.log('Mutate', { args, overrides });
    },
  });

  // useEffect(() => {
  //   async function processRequest() {
  //     if (contractData?.hash) {
  //       console.log(contractData?.hash);
  //       const receipt = await contractData?.wait();
  //       console.log(receipt);

  //       await axios.post('/api/requestPaid', {
  //         transactionHash: contractData?.hash,
  //         requestId: query?.requestId,
  //         walletAddress: address
  //       });
  //       setProcessingTransaction(false)
  //       push(`/pages/${request?.page?.slug}`)
  //     }
  //   }
  //   processRequest();
  // }, [contractData]);
  const placeholderImage = `/assets/placeholder/products/product-list.svg`;
  return (
    <div style={{ textAlign: 'center' }}>
      {/* <div style={{ borderRadius: '5px', margin: '10px', border: '1px solid grey' }}>
        <h3>Pay Request</h3>
        <div>{request?.name}</div>
        <div>{request?.description}</div>
        <div>{request?.price}</div>
        <button style={{ border: '1px solid grey' }} onClick={() => {
          if (request?.requestStatus === 'processing') {
            setProcessingTransaction(true)
            write?.()
          }
        }}>pay</button>
      </div> */}
      <Grid style={{ marginTop: '100px' }} container justifyContent="center">
        <Grid item xs={12} md={6}>
          <div className="text-xl font-bold mb-2">{tRequest('request-invitation-form-title')}</div>
          <div className="text-sm text-gray-800 mb-2">
            {tRequest('request-invitation-form-description')}
            {/* <MuiButton style={{ color: '#4B5971', paddingTop: 0, paddingBottom: 0, textDecoration: 'underline' }}>
            <img className="cursor-pointer inline align-middle" width={14} src="/icons/information.png" />
            <span className="ml-1 inline align-middle">{tRequest('request-invitation-form-introduction')}</span>
          </MuiButton> */}
          </div>
          <Card
            className="mb-6 p-6"
            style={{
              border: '1px solid rgb(233 233 233)',
              borderRadius: '14px',
              boxShadow: 'rgb(165 165 165 / 10%) 0px 0px 10px',
            }}
          >
            <Input
              label={tRequest('request-label-status')}
              name="page"
              type="text"
              variant="outline"
              className="mb-5"
              value={tRequest(`request-label-status-${request?.requestStatus}`)}
              disabled
            />
            <Input
              label={t('text-request-page')}
              name="page"
              type="text"
              variant="outline"
              className="mb-5"
              value={request?.page?.name}
              disabled
            />
            <Input
              label={tRequest('request-label-subject')}
              name='subject'
              type="text"
              variant="outline"
              className="mb-5"
              disabled
              value={request?.subject}
            />
            <Input
              label={tRequest('request-label-message')}
              name='message'
              type="text"
              variant="outline"
              className="mb-5"
              value={request?.message}
              disabled
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
              name='price'
              type="number"
              variant="outline"
              className="mb-5"
              value={request?.price}
              disabled
            />
            {/* <Input
              label={tRequest('request-label-accept-before')}
              name='acceptBefore'
              value={request?.acceptBefore}
              type="date"
              variant="outline"
              className="mb-5"
              disabled
            /> */}
            {request?.imageObj && <img src={request?.imageObj?.url} />}
            <Input
              label={tRequest('request-label-name')}
              name='name'
              type="text"
              variant="outline"
              className="my-5"
              value={request?.name}
              disabled
            />
            <Input
              label={tRequest('request-label-description')}
              name='description'
              type="text"
              variant="outline"
              className="mb-5"
              disabled
              value={request?.description}
            />
            <Input
              label={tRequest('request-label-url')}
              name='url'
              type="text"
              variant="outline"
              className="mb-5"
              value={request?.url}
              disabled
            />
            {/* <label className="block text-body-dark font-semibold text-sm leading-none mb-3">
              {tRequest('request-invitation-form-preview')}
            </label> */}
            {/* <div className="relative" style={{ width: 260, height: 170, margin: 'auto' }}>
            <Image
              src={request?.imageObj?.url ?? placeholderImage}
              layout={'fill'}
              quality={100}
              loader={({ src }) => { return src }}
              alt={request?.name || 'Request Image'}
              className="bg-gray-300 object-cover transition duration-200 ease-linear transform group-hover:scale-105 rounded-[8px]"
            />
            <div className="absolute top-0 right-0 bottom-0 left-0 text-white p-4 flex flex-col">
              <div className="flex justify-between items-center text-lg">
                <span>{request?.name}</span>
                <ArrowNextIcon />
              </div>
              <div className="overflow-hidden break-all">{requestDescription}</div>
            </div>
          </div> */}
            {request?.page?.website?.paymentMethod === 'crypto' ? (address && request?.requestStatus === 'processing') ? <MuiButton
              variant='outlined'
              className="w-full h-11 mt-8 sm:h-12"
              loading={processingTransaction}
              disabled={processingTransaction}
              onClick={() => {
                setProcessingTransaction(true)
                if (request?.page?.website?.chain?.name === 'Klaytn') {
                  klaytnWrite?.()
                } else if (request?.page?.website?.chain?.name === 'Polygon') {
                  polygonWrite?.()
                }
              }}
            >
              {t('pay')}
            </MuiButton> : request?.requestStatus === 'processing' ? <MuiButton
              className="w-full h-11 mt-8 sm:h-12"
              disabled={true}
            >
              {t('connect-wallet')}
            </MuiButton> : <></> : (request?.requestStatus === 'processing' && customer?.id) ? <MuiButton
              variant='outlined'
              className="w-full h-11 mt-8 sm:h-12"
              loading={processingTransaction}
              disabled={processingTransaction}
              onClick={async () => {
                const result = await usePrepareRequest({
                  variables: {
                    requestId: request?.id
                  }
                })
                if (result?.data?.prepareRequest?.url) {
                  push(result?.data?.prepareRequest?.url)
                }
              }}
            >
              {t('pay')}
            </MuiButton> : <>{!customer ? <Link href='/login'>Login</Link> : <></>}</>}


          </Card>
        </Grid>
      </Grid>

      <Modal
        open={processingTransaction}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: '20px',
          // border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {t('request.processingTransactionTitle')}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {t('request.processingTransactionDescription')}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}


export const getServerSideProps = async (context: any) => {
  const websiteSlug = context.req.headers.host.split('.')[0];

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
