# TutorNearMe — Editorial Utility

## Mục đích và ranh giới nguồn

Đây là visual direction đã được duyệt cho interactive prototype frontend-only của TutorNearMe. Hướng này dùng **Learning Editorial** làm nền tảng thương hiệu và **Clear Ledger** làm ngôn ngữ UI vận hành. Dữ liệu là mock/demo và state là local frontend; tài liệu này chỉ quy định hình ảnh và hành vi UI.

Tỷ lệ dưới đây định hướng mức độ nhấn, không tạo thành ba theme riêng:

| Role | Editorial | Clear Ledger | Cảm nhận cần đạt |
|---|---:|---:|---|
| Learner / Parent | 70% | 30% | Khám phá và so sánh thoáng, tạo cảm giác an tâm |
| Tutor | 35% | 65% | Workspace chuyên nghiệp, tập trung yêu cầu và lịch |
| Admin | 20% | 80% | Workspace vận hành gọn, phân cấp dữ liệu rõ |

Giữ Figma làm **structural reference** cho hierarchy layout, navigation, cách sắp section, grouping thông tin và interaction pattern hữu ích. Palette, typography, icon placeholder, decoration, shadow, radius và spacing chính xác của Figma không bắt buộc giữ. Xem [FIGMA_ANALYSIS.md](FIGMA_ANALYSIS.md) để tra findings cùng nhãn nguồn/evidence; không nhập nội dung evidence log đó vào đặc tả này.

## 1. Brand principles

- **Tinh thần giáo dục điềm tĩnh:** ấm áp, đáng tin, không dùng motif lớp học trẻ con.
- **Tạo niềm tin bằng sự rõ ràng:** thông tin nhận diện, năng lực, môn học, khu vực, lịch rảnh, học phí và trạng thái gia sư phải có hierarchy dễ đọc.
- **Tiết chế kiểu editorial:** typography hiển thị và whitespace tạo cá tính; không trang trí mọi bề mặt.
- **Tính vận hành khi cần xử lý công việc:** Tutor và Admin ưu tiên action, status, lịch và tốc độ quét thông tin.
- **Một thương hiệu, trải nghiệm riêng theo role:** dùng chung nền tảng token và quy ước tương tác, nhưng không làm ba dashboard chỉ khác dữ liệu.
- **Accessibility là nền tảng:** contrast, cỡ chữ, focus bàn phím và cách biểu thị trạng thái không phụ thuộc màu sắc.

## 2. Final color roles

Các giá trị dưới đây là token khởi điểm đã duyệt. Vai trò của token ổn định; có thể tinh chỉnh hex qua visual/accessibility review nhưng cần giữ tính cách palette và độ tương phản.

| Token | Giá trị | Vai trò |
|---|---|---|
| Canvas | `#F6F4EE` | Nền trang off-white ấm |
| Surface | `#FFFEFA` | Surface nội dung chính, form và overlay |
| Surface muted | `#EFEEE7` | Grouping nhẹ và vùng nền thay thế |
| Ink | `#1F2B25` | Text chính và nhấn trung tính mạnh |
| Text secondary | `#47534C` | Nội dung hỗ trợ |
| Text muted | `#647069` | Label phụ, chỉ dùng khi còn đủ contrast |
| Brand pine | `#2E5B46` | Action chính, navigation được chọn, link phù hợp |
| Terracotta | `#A64F38` | Điểm nhấn phụ tiết chế, nhất là nét editorial Learner |
| Border | `#D6DAD2` | Divider và viền control mặc định |
| Border strong | `#AAB4AB` | Ranh giới rõ hơn và cấu trúc table |

Ví dụ màu ngữ nghĩa:

| Trạng thái | Foreground | Background |
|---|---|---|
| Success | `#276246` | `#E8F0EA` |
| Warning | `#805400` | `#F7F0DE` |
| Danger | `#A33C35` | `#F7EAE7` |
| Info | `#355F70` | `#EAF0F2` |

Màu ngữ nghĩa phải đi kèm nhãn và khi hữu ích có thể thêm icon/dấu hiệu khác. Không để terracotta thành màu primary cạnh tranh hoặc dùng màu đơn lẻ để phân biệt trạng thái. Text cần đạt contrast theo WCAG AA (4.5:1 cho text thường; 3:1 cho text lớn và ranh giới/đồ họa UI có ý nghĩa khi phù hợp). Khi triển khai cần kiểm tra lại từng cặp token thực tế.

## 3. Typography system

- **Source Sans 3** là lựa chọn mặc định đã duyệt cho body và UI trên các role.
- **Literata** được duyệt để dùng tiết chế cho heading hiển thị/hero của Learner; không dùng trong table, form, ô calendar hay label UI nhỏ.
- Admin chỉ dùng sans-serif. Tutor phần lớn dùng sans-serif; khu vực vận hành không cần serif display.
- Đây là các font mặc định đã duyệt, **không phải dependency bất biến**. Nếu implementation cho thấy lỗi hiển thị tiếng Việt, giảm readability hoặc không tương thích kỹ thuật, chọn font tương đương có glyph tiếng Việt phù hợp và đặc tính thị giác/metrics gần tương tự. Cập nhật tài liệu này và `DESIGN.md`, ghi rõ lựa chọn thay thế và lý do.
- Ưu tiên sentence case, label ngắn, căn chỉnh số nhất quán và phân biệt rõ heading, body, metadata, status.

## 4. Type scale

Dùng scale sau làm điểm xuất phát; điều chỉnh line height và weight theo metrics của font đã chọn và dấu tiếng Việt:

| Vai trò | Cỡ / line-height | Ví dụ sử dụng |
|---|---|---|
| Display | 40 / 48 px | Chỉ hero trang discovery Learner |
| Page title | 32 / 40 px | Tiêu đề trang chính; giảm khi view dày thông tin |
| Section title | 24 / 32 px | Section nội dung chính |
| Subsection | 20 / 28 px | Nhóm nội dung phụ hoặc detail |
| Lead | 18 / 28 px | Đoạn giới thiệu hoặc summary được nhấn |
| Body | 16 / 24 px | Nội dung đọc và form mặc định |
| Compact body | 14 / 20 px | Control dày, metadata và table; không dùng làm body mặc định |
| Caption | 12 / 16 px | Label phụ, không dùng cho hướng dẫn thiết yếu |

Chỉ dùng display size khi cần. Heading dashboard không được lấn át nội dung vận hành. Tránh label viết hoa toàn bộ dài và weight quá mảnh trên nền ấm.

## 5. Spacing scale

Spacing token cơ sở: **4, 8, 12, 16, 24, 32, 40, 48, 64 px**. Cùng một scale được dùng xuyên suốt; density mode chọn giá trị phù hợp thay vì đặt spacing riêng cho từng màn.

### Quy tắc layout/container

- **Learner desktop:** căn giữa nội dung chính trong max-width container nhất quán, chọn giá trị trong khoảng **1200–1280px** tùy màn hình. Tái sử dụng container đó giữa search, profile và request khi hierarchy nội dung cho phép. View nhỏ dùng width linh hoạt và responsive side padding.
- **Tutor/Admin workspace:** shell có thể dùng nhiều chiều rộng viewport hơn Learner, nhất là calendar và table dữ liệu. Giữ page padding nhất quán trong từng shell và chọn theo density token bên dưới. Không để mỗi màn tự đặt left/right padding tùy ý.
- Giới hạn độ rộng vùng đọc/form thấp hơn workspace khi điều đó giúp dễ đọc. Layout dữ liệu thực sự rộng có thể dùng không gian khả dụng.
- Group section bằng spacing, alignment, heading, divider và chuyển nền có chủ đích trước khi thêm card.

## 6. Density modes

Density là quy tắc cấp role và phải ổn định giữa các màn. Một view có thể điều chỉnh cục bộ để vừa nội dung, nhưng không âm thầm đổi density tổng thể.

| Mode | Role | Page padding (desktop / tablet / mobile) | Khoảng cách section thường dùng | Chiều cao control thường dùng | Row table/list thường dùng |
|---|---|---|---|---|---|
| Comfortable | Learner / Parent | 32 / 24 / 16 px | 32–48 px | 44–48 px | 64–88 px cho nội dung so sánh gia sư |
| Standard | Tutor | 24 / 20 / 16 px | 24–32 px | 40–44 px | 52–64 px |
| Compact | Admin | 20 / 16 / 12 px | 16–24 px | 34–40 px | 40–48 px |

Đây là mục tiêu bố cục, không phải lý do giảm readability hoặc vùng tương tác. Trên thiết bị cảm ứng, vẫn giữ target đủ lớn dù cách trình bày dữ liệu xung quanh gọn. Compact mode giảm padding và nhịp row, không làm text thiết yếu nhỏ hơn type scale.

## 7. Radius scale

- `4px`: control gọn, action trong table và surface tiện ích Admin.
- `6px`: control và panel workspace Tutor.
- `8px`: button, input và container dùng chung mặc định.
- `10–12px`: card gia sư Learner, surface discovery và một số container editorial.
- `999px`: chỉ dùng cho chip status/tag ngắn khi nội dung phù hợp.

Không dùng dáng pill cho mọi button, input, tab hoặc card. Khác biệt giữa role nên thể hiện chủ yếu qua hierarchy và density, không phải các hệ hình dạng rời rạc.

## 8. Border và elevation

- Ưu tiên border/divider trung tính 1px cho control và cấu trúc table.
- Chỉ dùng border mạnh hơn để làm rõ grouping, lựa chọn đang active hoặc focus bàn phím.
- Elevation dùng tiết chế cho overlay, popover, menu và một số ít surface nổi.
- Tránh shadow thường trực quá nặng, border lồng nhau và card bên trong card.
- Chỉ đổi nền khi giúp làm rõ vùng nội dung hoặc trạng thái tương tác có ý nghĩa.

## 9. Icon rules

- **Lucide** là icon family mặc định đã duyệt, không phải dependency bất biến. Giữ một family và stroke language nhất quán giữa các role.
- Cỡ icon thường dùng 18–20px; control tiện ích Admin dày có thể dùng 16px nếu vẫn rõ và target không bị thu nhỏ.
- Icon hỗ trợ label hoặc action quen thuộc. Không thay label thiết yếu bằng icon khó hiểu.
- Không dùng emoji, Unicode glyph tùy tiện hoặc placeholder từ Figma làm icon final.
- Có thể thay Lucide bằng icon family tương đương nếu cần vì rendering hoặc technical compatibility; cập nhật đặc tả này và `DESIGN.md` kèm lý do.

## 10. Button rules

- **Primary:** nền pine, label tương phản cao, động từ rõ; mỗi vùng quyết định chỉ có một action primary nổi bật.
- **Secondary:** surface ấm, border trung tính thấy rõ, text ink.
- **Tertiary/quiet:** text hoặc mức nhấn thấp cho navigation và action inline ít rủi ro.
- **Destructive:** dùng treatment màu danger; yêu cầu xác nhận với action có hệ quả lớn.
- Learner có thể dùng terracotta làm CTA phụ hoặc điểm nhấn editorial tiết chế, nhưng pine vẫn là action thương hiệu chính dùng chung.
- Button cần thể hiện default, hover, focus-visible, pressed, disabled và loading khi phù hợp. Disabled vẫn phải đọc được.
- Target phù hợp loại thiết bị nhập liệu; density gọn không được tạo target chạm quá nhỏ.

## 11. Input/form rules

- Dùng surface trắng ấm, label rõ, ranh giới dễ thấy và chiều cao control theo density mode của role.
- Label luôn hiển thị kể cả khi đã nhập; placeholder là ví dụ/gợi ý, không phải label duy nhất.
- Focus cần có outline/border rõ, tránh chỉ đổi màu nếu có thể.
- Helper text, validation và lỗi đặt cạnh field liên quan. Lỗi cần đi kèm text/icon hoặc dấu hiệu khác ngoài màu.
- Nhóm field liên quan bằng spacing và heading; tránh bọc từng field thành card riêng.
- Ưu tiên pattern control ngày, giờ và lựa chọn quen thuộc/dễ hiểu.

## 12. Badge/status rules

- Dành badge gọn cho status, category và tag metadata ngắn.
- Kết hợp màu ngữ nghĩa với text tường minh; có thể thêm icon để củng cố ý nghĩa.
- Giữ wording trạng thái nhất quán giữa dashboard card, table, detail, schedule và request.
- Không biến mọi môn học, filter và metadata thành pill màu. Dùng text thường hoặc chip trung tính cho metadata không phải status.
- Trạng thái disabled, pending, confirmed, completed, cancelled và review/approval phải phân biệt được ở grayscale và với người khó phân biệt màu.

## 13. Card/surface rules

- Canvas ấm là nền mặc định. Surface trắng ấm dành cho nội dung cần ranh giới riêng như item so sánh gia sư, vùng form, detail panel hoặc overlay.
- Chỉ dùng card khi nội dung độc lập để scan/action hoặc thực sự cần container riêng. Không bọc mọi section bằng card.
- Card Learner có thể thoáng hơn với radius medium. Panel Tutor nên phẳng và có cấu trúc. Surface Admin phần lớn phẳng, phân tách bằng divider.
- Dùng alignment, whitespace, heading, separator và chuyển nền tiết chế để tạo hierarchy trước khi thêm shadow hay panel trang trí.

## 14. Table rules

- Ưu tiên hierarchy cột rõ, alignment ổn định, header ngắn, ranh giới row thấy được và status/action đặt gần record liên quan.
- Căn ngày, số lượng và tiền nhất quán. Không cắt identifier hoặc status chính nếu không có cách xem đầy đủ.
- Action theo row dễ tìm nhưng không lấn át dữ liệu. Dùng detail panel/drawer nếu workflow sẵn có hỗ trợ.
- Admin table theo compact density; text nội dung chính thường từ 14px trở lên, row height nhất quán. Metadata phụ có thể nhẹ hơn nhưng không được khó đọc.
- Ở màn hẹp, chọn chiến lược rõ cho từng table: scroll ngang có context, ưu tiên một số cột hoặc chuyển thành danh sách record. Không ép mọi cột vào chiều rộng gây khó đọc.

## 15. Calendar rules

- Giữ hierarchy thứ/ngày/giờ, thời lượng event và trạng thái dễ đọc. Dùng grid line rõ cùng event surface tiết chế thay vì card nặng.
- Không dùng serif trong ô calendar. Dùng label sans-serif và thông tin event ngắn.
- Phân biệt confirmed, upcoming và awaiting confirmation bằng label kèm màu/treatment.
- Desktop giữ geometry tuần hữu ích. Tablet/mobile chuyển sang agenda/day dễ đọc hoặc scroll ngang có chủ đích thay vì thu nhỏ text.
- Thể hiện empty, selected và current-day state mà không chỉ dựa màu. Control event phải thao tác được ở kích thước chạm.

## 16. Learner / Parent adaptation

- Giữ top navigation và luồng trang hướng khám phá từ structural reference.
- Dùng comfortable density và container desktop nhất quán rộng tối đa 1200–1280px.
- Hero/search có đủ nét editorial để giới thiệu mục đích, sau đó nhường ưu tiên hình ảnh cho filter, so sánh và chi tiết gia sư.
- Chỉ dùng Literata cho heading hiển thị tiết chế nếu tiếng Việt được render rõ và dễ đọc; body, label, filter, form và dữ liệu gia sư dùng sans-serif.
- Trình bày môn, khu vực, lịch, học phí, rating và thông tin tạo tin cậy theo alignment dễ so sánh. Ưu tiên ít card gia sư nổi bật hơn một lưới card trang trí đồng đều.
- Đặt action gửi yêu cầu gần gia sư được chọn và làm rõ bước tiếp theo.
- Giữ whitespace và surface radius medium thân thiện, nhưng không làm mất mật độ thông tin cần để so sánh.

## 17. Tutor adaptation

- Giữ workspace/sidebar và topbar theo structural reference.
- Dùng standard density: dày hơn Learner, page padding nhất quán 24/20/16px theo tier viewport.
- Làm agenda, incoming requests, availability và buổi học sắp tới thành trọng tâm vận hành.
- Ưu tiên grid căn chỉnh, separator và summary gọn hơn card trang trí. Chỉ dùng surface cho task độc lập hoặc detail tập trung.
- Phần lớn UI dùng sans-serif. Hiển thị action pending và lesson status cạnh request/session liên quan.
- Giữ control calendar/editor và quyết định request dễ tiếp cận mà không biến dashboard thành một bảng notification dày đặc.

## 18. Admin adaptation

- Giữ operational sidebar/topbar và hierarchy dữ liệu từ structural reference.
- Dùng compact density, page padding nhất quán 20/16/12px theo tier viewport.
- Chỉ dùng sans-serif. Tiêu đề thực dụng, tỷ lệ vừa phải với workspace dày thông tin.
- Ưu tiên table, filter, status, detail panel và action. Dùng surface phẳng và divider thay shadow.
- Dùng màu thương hiệu tiết chế cho navigation và action chính; màu ngữ nghĩa dành cho trạng thái và ý nghĩa action.
- Giữ tốc độ scan qua alignment cột ổn định, label gọn, vị trí filter nhất quán, status/action ở gần record. Đảm bảo text dễ đọc và focus rõ dù compact.

## 19. Responsive principles

Thiết kế cho desktop (≥1280px), tablet (768–1279px) và mobile (<768px), nhưng để nội dung và shell quyết định hành vi ở các breakpoint trung gian.

- Reflow bằng responsive container và grid; không bê tọa độ pixel desktop sang hoặc chỉ scale nhỏ lại.
- Learner: giữ top navigation khi đủ chỗ, đơn giản hóa ở viewport hẹp; xếp card so sánh; chuyển filter phức tạp vào drawer/sheet; đưa request panel thành inline hoặc full-width.
- Tutor: thu sidebar thành drawer hoặc navigation gọn phù hợp; giảm số cột dashboard; dùng agenda/day calendar trên màn nhỏ.
- Admin: giữ action/filter quan trọng dễ tới; thu navigation; ưu tiên cột table hoặc dùng record list/detail dễ đọc.
- Chọn page padding theo density mode của role. Tránh gutter riêng từng màn khiến shell thay đổi thất thường.
- Kiểm tra text tiếng Việt dài, wrapping, empty/loading/error state và thứ tự focus bàn phím trên màn hẹp.

## 20. Motion rules

- Transition nhanh, tiết chế, thường trong khoảng **120–200ms**.
- Chỉ animate để truyền đạt state, hierarchy hoặc navigation: focus, phản hồi pressed, disclosure, drawer/modal, loading progress và đổi status.
- Tránh chuyển động trang trí, parallax, spring nảy và page transition lớn.
- Tôn trọng reduced-motion preference; state change phải rõ ngay cả khi tắt animation.

## 21. Anti-patterns

- Gradient tím/xanh kiểu SaaS, gradient ngẫu nhiên hoặc glassmorphism.
- Card bo quá nhiều, mọi control dạng pill, hoặc mọi section đều bọc card.
- Shadow nặng, surface lồng nhau và decoration cạnh tranh với nội dung.
- Typography dashboard quá cỡ hoặc hero rộng rỗng trong view vận hành.
- Dùng serif trong table, form, calendar cell hoặc label nhỏ.
- Body/table quá nhỏ, contrast thấp, ẩn label hoặc focus khó nhìn.
- Trạng thái chỉ phân biệt bằng màu, wording status không nhất quán, hoặc mỗi role dùng một icon family khác.
- Dùng emoji/glyph placeholder trong Figma làm icon final.
- Responsive chỉ thu nhỏ desktop hoặc làm chữ calendar/table không đọc được.
- Tùy tiện thay density, page padding, row height hoặc control giữa các màn.

## 22. Do / Don't examples

| Nên làm | Tránh làm |
|---|---|
| Dùng Learner container desktop căn giữa, lặp lại nhất quán trong khoảng 1200–1280px. | Mỗi trang Learner đặt max-width bất kỳ khác nhau. |
| Cho Tutor/Admin dùng chiều rộng workspace, page padding chọn theo density mode. | Kéo dữ liệu sát cạnh không có inset hoặc tự đặt gutter từng màn. |
| Tạo hierarchy bằng whitespace, section heading và divider trước khi thêm surface. | Đưa mọi vùng dashboard vào card nổi bo tròn. |
| Dùng serif tiết chế cho hero Learner khi tăng được nét editorial. | Dùng serif trong form, table dữ liệu hoặc label calendar. |
| Giữ font và Lucide làm mặc định; ghi lại lựa chọn tương đương nếu gặp lỗi rendering/readability/compatibility. | Coi font và icon mặc định đã duyệt là dependency không thể thay. |
| Ghép status label với màu ngữ nghĩa và wording nhất quán. | Chỉ dùng màu để phân biệt pending/approved/cancelled. |
| Giữ row Admin gọn nhưng dễ đọc, action dễ tìm. | Thu text và target đến mức vừa bảng bằng mọi giá. |
| Duy trì comfortable/standard/compact density theo role. | Tùy ý đổi padding, row height và control trên từng màn. |
