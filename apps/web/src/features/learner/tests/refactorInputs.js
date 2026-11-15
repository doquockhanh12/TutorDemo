import {createDemoState,requestIsCompleted} from '../../domain/demoDomain.js';
import {demoReferenceData} from '../../../data/demoReferenceData.js';
import {initialLearnerConversations} from '../../../data/learnerConversations.js';
export const referenceDate=new Date('2026-11-15T05:34:00Z');
export function refactorInputs(){
 const state=createDemoState(referenceDate),user=demoReferenceData.accounts.find(x=>x.id==='demo-learner');
 const requests=state.requests.filter(x=>x.learnerId===user.id).map(x=>({...x,completed:requestIsCompleted(state,x)}));
 return {state,user,requests,tutors:state.profiles,conversations:initialLearnerConversations};
}
export const requestFilters=['all','pending','accepted','completed','cancelled','rejected'];
export const searchFilters=[
 {query:'',subject:'',location:'',availability:'',maxPrice:'all',sortBy:'recommended'},
 {query:'bao',subject:'',location:'',availability:'',maxPrice:'all',sortBy:'rating'},
 {query:'',subject:'',location:'',availability:'',maxPrice:'180000',sortBy:'price'},
];
