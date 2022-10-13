import ProductNftDetails from '@components/product/product-details-nft';
import ProductDetails from '@components/product/product-details';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import prisma from 'admin/src/server/context/prisma';
import processItem from '@process/item';
import Image from 'next/image';

import processWebsite from '@process/website';
import HomeLayout from '@components/layout/home-layout';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import Spinner from '@components/ui/loaders/spinner/spinner';
import { useTranslation } from 'next-i18next';
import { Network, Alchemy } from "alchemy-sdk";
import { useAccount } from 'wagmi';
import { useCustomer } from '@contexts/customer.context';
import { useFindManyOrderedProductQuery } from '@generated';
import { useQuery, gql } from '@apollo/client';
import { Modal, Grid, Backdrop, Fade, Box } from '@mui/material';
import Iconify from 'admin/src/components/Iconify';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY, // Replace with your Alchemy API Key.
  network: Network.MATIC_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

export default function ProductSinglePage({ product, website }: any) {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [nftBought, setNftBought] = useState(null)
  const [view, setView] = useState({});

  const { address } = useAccount();
  const { customer } = useCustomer();
  const { data: orderedProductData, refetch: refetchOrderedProduct } = useFindManyOrderedProductQuery({
    variables: {
      where: {
        product: {
          id: {
            equals: product?.id,
          },
        },
        order: {
          orderStatus: {
            equals: 'completed',
          },
          customer: {
            id: {
              equals: customer?.id,
            },
          },
          deleted: {
            not: {
              equals: true,
            },
          },
        },
      },
    },
    skip: !customer?.id || !product?.id,
  });
  const orderedProduct = orderedProductData?.findManyOrderedProduct?.[0];

  const { data: _productData, refetch: refetchProduct } = useQuery(
    gql`
      query findManyProduct($where: ProductWhereInput) {
        findManyProduct(where: $where) {
          id
          name
          slug
          productCollections {
            id
            name
            description
            displayTitle
          }
          audios {
            id
            name
            description
            imageObj
            audioObj
          }
          links {
            id
            name
            description
            imageObj
            url
            hiddenMessage
          }
          videos {
            id
            name
            description
            imageObj
            videoObj
          }
          documents {
            id
            name
            description
            imageObj
            documentObj
          }
          pictures {
            id
            name
            description
            imageObj
          }
          imageObj
          price
          sale_price
          slug
          website {
            themeColor
            currencyCode
            chain
            paymentMethod
          }
        }
      }
    `,
    {
      variables: {
        where: {
          slug: {
            equals: product?.slug,
          },
          active: {
            equals: true,
          },
        },
      },
      skip: (!orderedProduct && !nftBought) || !product?.slug
    },
  );
  const productData = _productData?.findManyProduct?.[0];

  useEffect(() => {
    async function fetchNft() {
      if (product?.editionAddress && address) {

        const nftsForOwner = await alchemy.nft.getNftsForOwner(address);
        console.log("number of NFTs found:", nftsForOwner.totalCount);

        // Print contract address and tokenId for each NFT:
        for (const nft of nftsForOwner.ownedNfts) {
          console.log("===");
          console.log("contract address:", nft.contract.address);
          console.log("token ID:", nft.tokenId);
          if (nft.contract.address.toLowerCase() === product?.editionAddress.toLowerCase()) {
            setNftBought(nft)
          }
        }
      }
    }
    fetchNft()
  }, [address, product])

  if (router.isFallback) {
    return <div className="flex justify-center items-center bg-light relative">
      <Spinner text='Loading' />
    </div>
  }
  return (
    <>
      <NextSeo
        openGraph={{
          url: `https://${website?.slug}.${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}/pages/${product?.slug}`,
          title: product?.name,
          description: product?.description,
          images: [
            { url: website?.imageObj?.url },
            { url: product?.imageObj?.url },
          ],
          site_name: website?.name,
        }}
        title={product?.name}
        description={product?.description}
        canonical={`https://${website?.slug}.${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}/products/${product?.slug}`}
      />
      <div className="bg-light min-h-screen pt-20">
        {(website?.paymentMethod === 'crypto' || product?.isExternalNft) ? <ProductNftDetails view={view} setView={setView} productData={productData} orderedProduct={orderedProduct} nftBought={nftBought} product={product} /> : <ProductDetails view={view} setView={setView} productData={productData} orderedProduct={orderedProduct} nftBought={nftBought} product={product} />}
      </div>
      <Modal
        open={!!view['type']}
        onClose={() => setView({})}
        closeAfterTransition
        aria-labelledby="product-modal-title"
        aria-describedby="product-modal-description"
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={!!view['type']}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: 1200,
              maxHeight: '90vh',
              width: 'calc(100% - 32px)',
              bgcolor: 'background.paper',
              borderRadius: '10px',
              boxShadow: 24,
              p: { xs: 3, sm: 6 },
              outline: 'none',
              overflow: 'auto',
            }}
          >
            <Grid
              container
              rowSpacing={3}
              columnSpacing={3}
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent={{ sm: 'center' }}
              alignItems={{ xs: 'center', sm: 'flex-start' }}
            >
              <Grid item width={'240px'} justifyContent="center">
                <Image
                  className="rounded-full"
                  src={view?.imageObj?.url ?? '/product-placeholder.svg'}
                  width="100%"
                  height="100%"
                  layout="responsive"
                  objectFit="cover"
                  alt={view?.name}
                  loader={({ src }) => { return src }}
                />
              </Grid>
              <Grid item xs>
                <h4 className="flex items-center gap-x-2 text-[#212B36] text-[24px]">
                  <span>{view.name}</span>
                  {view.status === 'purchased' && view.type === 'link' ? (
                    <a href={view.url}>
                      <Iconify icon={'lucide:external-link'} />
                    </a>
                  ) : (
                    []
                  )}
                </h4>
                <p className="text-[#637381] text-[18px]">{view.description}</p>
              </Grid>
              {view.status === 'purchased' ? (
                <>
                  {view.hiddenMessage ? (
                    <Grid item xs={12}>
                      <div className="bg-[#F8F8F8] p-5">
                        <div className="flex items-center text-[14px] text-[#637381] font-bold gap-x-1">
                          <Iconify icon={'lucide:unlock'} />
                          <span>{t('text-hidden-message')}</span>
                        </div>
                        <div className="text-[212B36]">{view.hiddenMessage}</div>
                      </div>
                    </Grid>
                  ) : (
                    []
                  )}
                  {view.videoObj ? (
                    <Grid item xs={12}>
                      <video className="h-[50vh] w-[100%]" controls>
                        <source src={view.videoObj.url} />
                        Your browser does not support the video tag.
                      </video>
                    </Grid>
                  ) : (
                    []
                  )}
                  {view.audioObj ? (
                    <Grid item xs={12}>
                      <audio className="w-[400px] mx-auto" controls>
                        <source src={view.audioObj.url} />
                        Your browser does not support the audio tag.
                      </audio>
                    </Grid>
                  ) : (
                    []
                  )}
                </>
              ) : (
                []
              )}
            </Grid>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

export const getStaticPaths = async ({ locales }) => {
  // const products = await prisma.product.findMany({
  //   where: {},
  //   include: {
  //     website: true,
  //   },
  // });
  // const paths = products
  //   .filter(
  //     (product) =>
  //       product.active && !product.deleted && product.website && product.website.active && !product.website.deleted,
  //   )
  //   .map((product) =>
  //     locales.map((locale) => ({
  //       params: {
  //         productSlug: product?.slug,
  //         websiteSlug: product?.website?.slug,
  //       },
  //       locale, // Pass locale here
  //     })),
  //   )
  //   .flat();

  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  if (!params) throw new Error('No path parameters found');

  const { productSlug, websiteSlug } = params;
  const product = await prisma.product.findUnique({
    where: {
      slug: productSlug,
    },
    include: {
      website: true,
      videos: true,
      audios: true,
      documents: true,
      pictures: true,
      links: true,
    },
  });
  if (product) {
    product.pictures = product?.pictures?.map((picture) => {
      delete picture?.imageObj
      return picture
    })
    product.videos = product?.videos?.map((video) => {
      delete video?.videoObj
      return video
    })
    product.audios = product?.audios?.map((audio) => {
      delete audio?.audioObj
      return audio
    })
    product.links = product?.links?.map((link) => {
      delete link?.url
      delete link?.hiddenMessage
      return link
    })
    product.documents = product?.documents?.map((document) => {
      delete document?.documentObj
      return document
    })
  }

  const website = await prisma.website.findUnique({
    where: {
      slug: websiteSlug,
    },
    include: {
      pages: true,
    },
  });

  if (!product || !website)
    return {
      notFound: true,
      // revalidate: 10,
      props: {
        ...(await serverSideTranslations(locale!, ['common'])),
      },
    };

  return {
    props: {
      website: processWebsite(website),
      product: processItem(product),
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    // revalidate: 20,
  };
};
