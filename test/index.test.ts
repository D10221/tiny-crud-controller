import { join } from "path";
import { CrudController, ensureBody, ensureID, Repo, validate } from "../src"; 
import { RequestHandler } from "express";
import { json } from "body-parser";
import uuid from "uuid";
import express from "express";

/** */
interface Things {
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
/**
 * 
 */
describe(require(join(__dirname, "../package.json")).name, ()=> {
    it("works", ()=> {
        // TODO:         
        /** Implement Repo  */
        const repo = {
            all(){
                return Promise.resolve([]);
            },
            byId(id: string){
                return Promise.resolve({ id });
            },
            add(x: {}){
                return Promise.resolve(x);
            },
            remove(id: string){
                return Promise.resolve();
            },
            update(x: {}){
                return  Promise.resolve(x);
            }
        };
         const crud = CrudController(repo);
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
             ensureBody<Things, keyof Things>(["displayName", "name", "notes"]),
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