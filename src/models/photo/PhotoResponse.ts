import { PersonInfo } from './PersonInfo';

export interface PhotoResponse { 
    log_id: number; 
    labelmap: string; 
    scoremap: string; 
    foreground: string; 
    person_num: number; 
    person_info: PersonInfo[]; 
}