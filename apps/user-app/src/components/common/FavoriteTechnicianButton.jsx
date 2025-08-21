import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavoriteThunk, removeFavoriteThunk, getFavoritesThunk } from '../../features/favorites/favoriteSlice';
import { toast } from 'react-toastify';

const FavoriteTechnicianButton = ({ technicianId, className = '' }) => {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.favorites);
  const getId = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj._id) return obj._id;
    if (obj.userId) return getId(obj.userId);
    return '';
  };

  const isFavGlobal = list.some((fav) => getId(fav.technicianId) === String(technicianId));
  const [fav, setFav] = useState(isFavGlobal);

  useEffect(() => {
    dispatch(getFavoritesThunk());
  }, [dispatch]);

  useEffect(() => { setFav(isFavGlobal); }, [isFavGlobal]);

  const toggle = () => {
    if (fav) {
      dispatch(removeFavoriteThunk(technicianId)).then(() => {
        dispatch(getFavoritesThunk());
        toast.info('Đã xóa khỏi yêu thích');
      });
    } else {
      dispatch(addFavoriteThunk(technicianId)).then(() => {
        dispatch(getFavoritesThunk());
        toast.success('Đã thêm vào yêu thích');
      });
    }
    setFav(!fav);
  };

  return (
    <>
      <button
      type="button"
      className={`favorite-btn ${fav ? 'active' : ''} ${className}`}
      onClick={toggle}
      title={fav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <i className={`bi ${fav ? 'bi-heart-fill' : 'bi-heart'}`}></i>
    </button>
<style>{`
/* Nút tim */
.favorite-btn{
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #eef0f3;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(16, 24, 40, 0.08);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background-color .18s ease;
}
.favorite-btn .bi{
  font-size: 1.8rem;
  color: #ff9f43;      /* icon cam nhạt khi chưa active */
  transition: transform .18s ease, color .18s ease;
}

.favorite-btn:hover{
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(16, 24, 40, 0.14);
  border-color: #ffd9b0;
  background: #fffdf9;
}

.favorite-btn .bi::before{
  font-size: 20px !important;   /* tăng icon */
  line-height: 1;               /* canh giữa đẹp hơn */
}

.favorite-btn:active{
  transform: scale(.94);
}

/* Trạng thái đã yêu thích */
.favorite-btn.active{
  border-color: #ffc48d;
  background: linear-gradient(180deg, #fff7ed, #fff);
}
.favorite-btn.active .bi{
  color: #fd2d03;  /* cam đậm hơn */
  transform: scale(1.05);
}

/* Hiệu ứng “pop” nho nhỏ khi chuyển active */
.favorite-btn.active::after{
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 0 0 0 rgba(255,159,67,.35);
  animation: fav-pop .5s ease-out forwards;
}
@keyframes fav-pop{
  0%   { box-shadow: 0 0 0 0 rgba(255,159,67,.35); }
  100% { box-shadow: 0 0 0 12px rgba(255,159,67,0); }
}

/* Đặt nút tim lên góc phải thẻ */
.fav-abs{
  position: absolute;
  right: 12px;
  top: 12px;
}
 
`}</style>
</>
  );
};

export default FavoriteTechnicianButton;
