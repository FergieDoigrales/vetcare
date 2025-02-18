package org.fergoeqs.coursework.services;

import org.springframework.stereotype.Service;
import io.minio.*;
import io.minio.http.Method;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;
@Service
public class StorageService {
    private final MinioClient minioClient;


    public StorageService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public void uploadFile(String bucketName, String objectName, InputStream inputStream, String contentType) {
        String tempBucket = bucketName + "-temp";
        String tempObjectName = "temp-" + objectName;

        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            minioClient.copyObject(
                    CopyObjectArgs.builder()
                            .source(CopySource.builder()
                                    .bucket(tempBucket)
                                    .object(tempObjectName)
                                    .build())
                            .bucket(bucketName)
                            .object(objectName)
                            .build());

            minioClient.removeObject(RemoveObjectArgs.builder().bucket(tempBucket).object(tempObjectName).build());

        } catch (Exception e) {
            throw new RuntimeException("Error during two-phase commit occurred: " + e.getMessage());
        }
    }

    public void prepareUploadFile(String bucketName, String objectName, InputStream inputStream, String contentType){
        String tempBucket = bucketName + "-temp";
        String tempObjectName = "temp-" + objectName;
        try {
            boolean tempBucketFound = minioClient.bucketExists(BucketExistsArgs.builder().bucket(tempBucket).build());
            if (!tempBucketFound) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(tempBucket).build());
            }
            minioClient.putObject(
                    PutObjectArgs.builder().bucket(tempBucket).object(tempObjectName).stream(
                                    inputStream, inputStream.available(), -1)
                            .contentType(contentType)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error during file preparation phase: " + e.getMessage());
        }

    }

    public void deleteFile(String bucketName, String objectName) {
        String tempBucket = bucketName + "-temp";
        String tempObjectName = "temp-" + objectName;
        try {
            minioClient.removeObject(RemoveObjectArgs.builder().bucket(tempBucket).object(tempObjectName).build());
            minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(objectName).build());
        } catch (Exception e) {
            System.out.println("Failed to connect MinIO: " + e.getMessage());
        }
    }

    public String generateUrl(String bucketName, String objectName) {
        try {
            GetPresignedObjectUrlArgs getPresignedObjectUrlArgs = GetPresignedObjectUrlArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .method(Method.GET)
                    .expiry(1, TimeUnit.HOURS)
                    .build();

            return minioClient.getPresignedObjectUrl(getPresignedObjectUrlArgs);
        } catch (Exception e) {
            throw new RuntimeException("Error generating URL", e);
        }
    }

}

