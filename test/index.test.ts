import { json } from "body-parser";
import express, { RequestHandler } from "express";
import { join } from "path";
import uuid from "uuid";
import { AsyncMap, CrudController, ensureBody, ensureID, validate } from "../src";

/** */
interface Thing {
    /** generic */
    id: string;
    name: string;
    displayName: string;
    notes: string;
    /** generic */
    createdAt: number;
    /** generic */
    updatedAt: number;
    /** generic: owner/user id */
    userid: string;
}
class AMap implements AsyncMap<{}>{    
    map = new Map();
    get = (key: string)=>  Promise.resolve(this.map.get(key));
    set = (key: string)=>  Promise.resolve(this.map.get(key));
    clear = () => Promise.resolve(this.map.clear());
    delete = (key: string) =>  Promise.resolve(this.map.delete(key));
    forEach = (callback: (value: {}, key: string, map: AsyncMap<{}>) => any) => this.map.forEach((key, value)=> callback(key, value, this));
    has = (key: string) => Promise.resolve(this.map.has(key));    
}
/**
 * 
 */
describe(require(join(__dirname, "../package.json")).name, ()=> {
    it("May Work", ()=> {               
        
         const crud = CrudController(new AMap());
         const endpoint = "things";
         const route = `/api/${endpoint}/:id?`;
         // ... 
         const app = express();
         /** READ/GET */
         app.get(route, [ /*extra-middleware*/ crud.get()]);         
         /** ADD/PUT*/
         app.put(route, [
              /*extra-middleware*/
             json(),
             ensureBody<Thing, keyof Thing>(["displayName", "name", "notes"]),
             ensureID(uuid),
             validate( req => {                 
                 const validation:string[] = [];
                 if(!req.body.id){
                     validation.push("missing id")
                 }
                 return Promise.resolve(validation);
             }),
             ((req, _res, next) => {
                 // include user
                 try {
                     req.body.userid = (req as any).user.id
                     return next();
                 } catch (error) {
                     return next(error);
                 }
             }) as RequestHandler,
             crud.put()
         ]);
         /** UPDATE/POST */
         app.post(route, [
            /*extra-middleware*/
            json(),
            ensureBody(),
            ensureID(), // reject missing id
            crud.post()
        ]);
        /** DELETE/REMOVE */
        app.delete(route, [
            /*extra-middleware*/
            ensureBody(),
            ensureID(), // reject no id            
            crud.dlete()
        ]);
    })
});