export namespace InterfacesProjectSpecificInterfaces {
  export interface IGuard<TypeGuard> {
    _guard: TypeGuard;
  }

  export const videoNameTypeGuard: `videoNameTypeGuard` = `videoNameTypeGuard`;

  export interface IVideoName extends IGuard<typeof videoNameTypeGuard> {
    videoName: string;
  }

  export const newVideoName = (videoName: string): IVideoName => {
    return {
      _guard: videoNameTypeGuard,
      videoName: videoName,
    };
  };
}
