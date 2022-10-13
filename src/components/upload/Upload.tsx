import React, { useState } from 'react';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
// import XHR from '@uppy/xhr-upload';
import { Dashboard } from '@uppy/react';
import '@uppy/dashboard/dist/style.css';
import Chinese from '@uppy/locales/lib/zh_CN';
import { useEffect } from 'react';
import axios from '../../utils/axios';
import { useSignUploadUrlMutation, useCreateOneAttachmentMutation } from '../../generated';

function Upload(props) {
  let allowedFileTypes = [];
  switch (props.attachmentType) {
    case 'image':
      allowedFileTypes = ['image/*'];
      break;
    case 'audio':
      allowedFileTypes = ['audio/*'];
      break;
    case 'video':
      allowedFileTypes = ['video/*'];
      break;
    default:
      break;
  }

  const uppy = new Uppy({
    meta: props.meta || {},
    restrictions: {
      maxNumberOfFiles: props.maxNumberOfFiles || null,
      allowedFileTypes,
      maxFileSize: props.maxFileSize || null, //  byte
    },
    autoProceed: props.autoProceed || false,
    // locale: Chinese,
  });
  const [signUploadUrl] = useSignUploadUrlMutation();
  const [createAttachment] = useCreateOneAttachmentMutation();

  uppy.use(AwsS3, {
    getUploadParameters(file) {
      return axios
        .post(`/api/s3`, {
          filename: file.name,
          contentType: file.type,
          acl: 'public-read',
        })
        .then((result) => {
          return {
            method: 'put',
            url: result.data,
            fields: [],
            headers: {
              'x-amz-acl': 'public-read',
              'content-type': file.type,
            },
          };
        });
    },
    // note: using rest instead of gql for progress bar showing
    // getUploadParameters(file) {
    //   return signUploadUrl({
    //     variables: {
    //       filename: file.name,
    //       contentType: file.type,
    //       acl: 'public-read',
    //     },
    //   }).then((result) => {
    //     return {
    //       method: 'put',
    //       url: result.data.signUploadUrl,
    //       fields: [],
    //       headers: {
    //         'x-amz-acl': 'public-read',
    //         'content-type': file.type,
    //       },
    //     };
    //   });
    // },
  });

  uppy.on('complete', async (result) => {
    // const url = result.successful[0].uploadURL;

    await Promise.all(
      result.successful.map(async (newFile) => {
        let a = await createAttachment({
          variables: {
            data: {
              url: newFile.uploadURL,
              upload: JSON.parse(JSON.stringify(newFile)),
              type: props.attachmentType,
            },
          },
        });
        return a
      })
    );
    const urls = result.successful.map((newFile) => {
      return {
        url: newFile.uploadURL,
      };
    });

    props.onComplete && props.onComplete(urls);
  });

  uppy.on('upload-error', (file, error, response) => {
    console.log(error);
  });

  return (
    <div className="mb-5">
      <Dashboard height={400} uppy={uppy} />
    </div>
  );
}

export default Upload;
