export const colors = {
  ink: '#0B1020',
  inkElevated: '#151B2E',
  inkCard: '#1C2338',
  lime: '#C8F542',
  grape: '#7B5CFF',
  hot: '#FF4D6D',
  cream: '#F4F1EA',
  mute: '#9EA7C2',
  good: '#4AE3A8',
};

export const googleDarkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1b2133' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1b2133' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b93ab' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1020' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#c8f542' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3148' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0b1020' }] },
];
