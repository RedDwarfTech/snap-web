
export type photoAction = removePhotoBackgroundAction;

export enum PhotoActionType {
    REM_BACKGROUND,
}

export interface removePhotoBackgroundAction {
    type: PhotoActionType.REM_BACKGROUND;
    data: any;
}



