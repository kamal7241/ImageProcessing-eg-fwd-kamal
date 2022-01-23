import { isFileExist } from './../utils/index';
import { NextFunction, Request, Response } from "express";
import ImageRequest from "../modules/ImageRequest";
import path from 'path';
import sharp from "sharp";
import { ImageSize } from '../modules';
export const validationMW = async (req:Request , res : Response , next : NextFunction):Promise<void>=>{
    const { width  , height , filename } = req.query ;
    let imageRequest:ImageRequest = req;
    if(!filename)
        throw new Error("please provide image name");
    try {
        if(!await isFileExist(path.resolve(__dirname , '../assets/images' , filename as string + '.jpg'))){
           next( new Error("sorry file not exist")) 
        };
    } catch (error) {
        next(new Error('something went wront'))
    }
    if(width)
    imageRequest.width = parseInt(width as string);
    if(height)
        imageRequest.height = parseInt(height as string);
    const processedFileName:string = (filename as string) + '.thumbs.png';
    try {
        if(await isFileExist(path.resolve(__dirname , "../assets/thumbs" , processedFileName ))){
            imageRequest.alreadyProcessed = true;
         }
        
    } catch (error) {
        next(new Error('something went wront'))
    }
    imageRequest.fileName = (filename as string) + '.jpg';
    imageRequest.processedFileName = processedFileName
    next();
}
export const processImageMw = async (req:ImageRequest , res : Response , next : NextFunction):Promise<void>=>{
    
    const image = sharp(path.resolve(__dirname ,"../assets/images",  req.fileName || ''   ) )
    try {
                await image.resize({width : req.width , height : req.height})
                .png({quality : 80 , compressionLevel : 9 , progressive: true  , adaptiveFiltering  : true})
                .toFile(path.resolve(__dirname , "../assets/thumbs" ,  req.processedFileName || ''  ) )
            next();
        } catch (error) {   
            next(new Error('something went wront' ) )
        }
}
export default { validationMW ,  processImageMw  };