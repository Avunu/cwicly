import { Fragment, createElement } from '@wordpress/element';

/**
 * Semantic replacement for the Background helper component.
 */
export function BackgroundEditorHelper({ attributes }) {
  const {
    backgroundYoutubeURL,
    backgroundClipPathContent,
    backgroundClipPathBlob,
    backgroundVideoURL,
    backgroundType,
    backgroundVideoSource,
    backgroundVideoLoop,
    id,
    classID,
    separatorTypeTop,
    separatorTypeBottom
  } = attributes;

  // Assuming a helper for device pseudo-class (like (0, i.u)() in the original)
  // This would typically come from a store or a custom hook.
  const currentDevice = 'desktop'; // Placeholder logic

  const youtubeID = backgroundYoutubeURL?.split("v=")[1]?.substring(0, 11);

  return (
    <Fragment>
      {backgroundClipPathContent && backgroundClipPathBlob && (
        <svg height="0" width="0">
          <defs>
            <clipPath id={`${classID}-path`}>
              <path d={backgroundClipPathContent} />
            </clipPath>
          </defs>
        </svg>
      )}

      {backgroundVideoURL && backgroundType?.[currentDevice] === 'video' && backgroundVideoSource === 'mp4' && (
        <div id={`${id}-player-wrapper`} className="cc-background-video">
          <video
            id={`${id}-player`}
            loop={backgroundVideoLoop ? null : true}
            muted
            autoPlay
            playsInline
            src={backgroundVideoURL}
          />
        </div>
      )}

      {backgroundType?.[currentDevice] === 'video' && backgroundVideoSource === 'youtube' && backgroundYoutubeURL && (
        <Fragment>
          <div id={`${id}-player-wrapper`} className="cc-background-video" />
          <div className="video-background-container">
            <div className="video-background">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeID}?controls=0&modestbranding=1&showinfo=0&rel=0&autoplay=1&loop=${backgroundVideoLoop ? 0 : 1}&mute=1&playlist=${youtubeID}`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </Fragment>
      )}

      {(backgroundVideoURL || backgroundYoutubeURL) && backgroundType?.[currentDevice] === 'video' && (
        <div className="cc-overlay-video-background" />
      )}
      
      {/* Separators would be rendered here using a Separator component */}
      {/* <Separators id={id} typeTop={separatorTypeTop} typeBottom={separatorTypeBottom} {...attributes} /> */}
    </Fragment>
  );
}
