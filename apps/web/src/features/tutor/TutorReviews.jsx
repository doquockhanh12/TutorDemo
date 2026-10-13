
import { useMemo, useState } from 'react';
import {
  Star,
  Search,
  MessageSquare,
  Send,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react';
import { TutorShell } from './TutorPages.jsx';
import './tutor-reviews.css';

const initialReviews = [
  {
    id: 1,
    name: 'Nguyễn Minh Anh',
    subject: 'Tiếng Anh',
    date: '08/10/2026',
    rating: 5,
    comment:
      'Thầy dạy rất dễ hiểu, nhiệt tình và chuẩn bị bài học chu đáo. Sau một thời gian học, em tự tin hơn nhiều.',
    reply: '',
  },
  {
    id: 2,
    name: 'Trần Khánh Linh',
    subject: 'IELTS',
    date: '06/10/2026',
    rating: 5,
    comment:
      'Lộ trình học rõ ràng, được sửa bài chi tiết và hướng dẫn cách cải thiện từng kỹ năng.',
    reply: 'Cảm ơn em! Chúng ta sẽ tiếp tục cải thiện kỹ năng Writing nhé.',
  },
  {
    id: 3,
    name: 'Phạm Gia Huy',
    subject: 'Tiếng Anh',
    date: '03/10/2026',
    rating: 4,
    comment:
      'Buổi học hiệu quả, thầy giải đáp thắc mắc kỹ. Mong có thêm bài tập luyện ở nhà.',
    reply: '',
  },
  {
    id: 4,
    name: 'Lê Ngọc Mai',
    subject: 'IELTS',
    date: '01/10/2026',
    rating: 5,
    comment:
      'Thầy theo sát tiến độ và điều chỉnh bài học phù hợp với trình độ của em.',
    reply: '',
  },
  {
    id: 5,
    name: 'Đỗ Hoàng Nam',
    subject: 'Tiếng Anh',
    date: '28/09/2026',
    rating: 3,
    comment:
      'Nội dung tốt, nhưng đôi khi em muốn có thêm thời gian thực hành trong buổi học.',
    reply: '',
  },
];

function Stars({ value, size = 17 }) {
  return (
    <span className="review-stars" aria-label={`${value} trên 5 sao`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          fill={index < value ? 'currentColor' : 'none'}
          strokeWidth={1.8}
          className={index < value ? 'is-filled' : ''}
        />
      ))}
    </span>
  );
}

export default function TutorReviews() {
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [notice, setNotice] = useState('');

  const average = reviews.length
    ? reviews.reduce((sum, item) => sum + item.rating, 0) /
      reviews.length
    : 0;

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !keyword ||
        review.name.toLowerCase().includes(keyword) ||
        review.subject.toLowerCase().includes(keyword) ||
        review.comment.toLowerCase().includes(keyword);

      const matchesRating =
        ratingFilter === 'all' ||
        review.rating === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((item) => item.rating === star).length,
  }));

  function saveReply(id) {
    if (!replyText.trim()) return;

    setReviews((current) =>
      current.map((review) =>
        review.id === id
          ? { ...review, reply: replyText.trim() }
          : review
      )
    );

    setReplyingId(null);
    setReplyText('');
    setNotice('Đã lưu phản hồi demo.');
  }

  return (
    <TutorShell
      title="Đánh giá"
      subtitle="Theo dõi phản hồi từ học viên và cải thiện chất lượng giảng dạy."
    >
      <div className="tutor-reviews">
        {notice && (
          <p className="reviews-notice" role="status">
            {notice}
          </p>
        )}

        <section className="reviews-overview">
          <article className="reviews-score">
            <span className="reviews-muted">Điểm đánh giá trung bình</span>
            <div className="reviews-score__number">
              {average.toFixed(1)}
              <span>/5</span>
            </div>
            <Stars value={Math.round(average)} size={21} />
            <p>{reviews.length} đánh giá từ học viên</p>
          </article>

          <article className="reviews-distribution">
            <h2>Phân bố đánh giá</h2>
            {distribution.map(({ star, count }) => (
              <div className="reviews-bar-row" key={star}>
                <span>{star} sao</span>
                <div className="reviews-bar">
                  <span
                    style={{
                      width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span>{count}</span>
              </div>
            ))}
          </article>

          <article className="reviews-highlight">
            <div className="reviews-highlight__icon">
              <ThumbsUp size={22} />
            </div>
            <h2>Tiếp tục phát huy!</h2>
            <p>
              Lắng nghe góp ý và phản hồi học viên để nâng cao trải nghiệm
              học tập.
            </p>
          </article>
        </section>

        <section className="reviews-list-panel">
          <div className="reviews-list-heading">
            <div>
              <h2>Đánh giá từ học viên</h2>
              <p>{filteredReviews.length} kết quả</p>
            </div>

            <label className="reviews-filter">
              <span className="sr-only">Lọc theo số sao</span>
              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
              >
                <option value="all">Tất cả số sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </label>
          </div>

          <label className="reviews-search">
            <Search size={18} />
            <span className="sr-only">Tìm kiếm đánh giá</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo học viên, môn học hoặc nội dung..."
            />
          </label>

          <div className="reviews-list">
            {filteredReviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card__avatar" aria-hidden="true">
                  {review.name.split(' ').slice(-1)[0].charAt(0)}
                </div>

                <div className="review-card__body">
                  <div className="review-card__top">
                    <div>
                      <h3>{review.name}</h3>
                      <p>
                        {review.subject} <span>·</span> {review.date}
                      </p>
                    </div>
                    <Stars value={review.rating} />
                  </div>

                  <p className="review-card__comment">{review.comment}</p>

                  {review.reply && (
                    <div className="review-reply">
                      <MessageCircle size={16} />
                      <div>
                        <strong>Phản hồi của gia sư</strong>
                        <p>{review.reply}</p>
                      </div>
                    </div>
                  )}

                  {replyingId === review.id ? (
                    <div className="review-reply-form">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        placeholder="Nhập phản hồi của bạn..."
                        autoFocus
                      />
                      <div>
                        <button
                          type="button"
                          className="reviews-button reviews-button--secondary"
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText('');
                          }}
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          className="reviews-button"
                          disabled={!replyText.trim()}
                          onClick={() => saveReply(review.id)}
                        >
                          <Send size={15} />
                          Lưu phản hồi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="review-reply-trigger"
                      onClick={() => {
                        setReplyingId(review.id);
                        setReplyText(review.reply);
                        setNotice('');
                      }}
                    >
                      <MessageSquare size={15} />
                      {review.reply ? 'Sửa phản hồi' : 'Phản hồi đánh giá'}
                    </button>
                  )}
                </div>
              </article>
            ))}

            {filteredReviews.length === 0 && (
              <div className="reviews-empty">
                <Star size={28} />
                <h3>Không tìm thấy đánh giá</h3>
                <p>Thử thay đổi từ khóa hoặc bộ lọc số sao.</p>
              </div>
            )}
          </div>
        </section>

        <p className="reviews-demo-note">
          Dữ liệu đánh giá và phản hồi hiện chỉ phục vụ bản demo frontend.
        </p>
      </div>
    </TutorShell>
  );
}
