import React from 'react';
import { PlayCircle } from 'lucide-react';

export default function VideoBlock({ data }: { data: any }) {
  // Lấy ID Youtube từ URL (Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ -> dQw4w9WgXcQ)
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = data.youtubeUrl ? getYoutubeId(data.youtubeUrl) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gov-primary text-white p-3 flex items-center">
        <PlayCircle className="w-5 h-5 mr-2" />
        <h2 className="font-bold uppercase tracking-wide">{data.title || 'Video nổi bật'}</h2>
      </div>
      <div className="p-4 bg-gray-900 aspect-video relative">
        {videoId ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            Link Video không hợp lệ
          </div>
        )}
      </div>
    </div>
  );
}
