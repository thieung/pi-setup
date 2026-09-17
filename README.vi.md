# pi-setup

[English](README.md) | **Tiếng Việt**

Bộ setup Pi Coding Agent có tính portable và reproducible, hỗ trợ nhiều máy và nhiều profile.

Mục tiêu rất đơn giản: dùng một Git repository làm source of truth cho cấu hình Pi, clone xuống laptop, workstation hoặc VPS, rồi chuyển qua lại giữa profile stable, development hoặc custom mà không phải copy toàn bộ setup.

## Repo này giải quyết vấn đề gì?

Một setup Pi thường lớn dần theo thời gian: packages, extensions, model/provider preferences, local extensions, themes và machine-specific state. Copy nguyên `~/.pi/agent` giữa các máy ban đầu khá tiện, nhưng cũng dễ mang theo cache, session, absolute path, generated files và credentials.

Repo này đi theo hướng khác:

- Git chỉ lưu cấu hình portable và profile definitions.
- Runtime data của Pi được materialize riêng theo từng profile dưới `~/.pi/profiles/`.
- `pi` là stable daily-driver profile.
- `pi-dev` kế thừa `pi` và thêm các extension/provider dùng cho thử nghiệm.
- Có thể tạo custom profile động và cho nó kế thừa bất kỳ profile nào đang tồn tại.
- npm extensions được pin version trong profile manifest để setup có thể tái tạo giống nhau trên máy khác.
- Source extensions được pin theo Git commit trong `config/source-extensions.json`.
- Credentials, sessions, caches và machine-specific state không được đưa vào Git.

## Các profile hiện tại

| Profile | Mục đích | Kế thừa | Extensions được bật |
|---|---|---|---|
| `pi` | Dùng hằng ngày, ổn định | Base config | `statusline-pi@1.3.1` |
| `pi-dev` | Test extension/provider | `pi` | stable set + `advisor-pi@1.1.0`, `opencode-pi@1.3.0`, optional source overlay |
| custom profiles | Các biến thể theo mục đích riêng | bất kỳ profile nào đang tồn tại | định nghĩa theo từng profile |

Quy tắc mặc định quan trọng:

> `pi-dev = pi + experimental overlay`

Custom profile cũng dùng cùng inheritance model thay vì copy toàn bộ settings.

## Quick start

```bash
git clone git@github.com:thieung/pi-setup.git
cd pi-setup
./scripts/bootstrap.sh
```

Nếu `~/.local/bin` chưa có trong `PATH`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Chạy một profile:

```bash
pi-profile pi
pi-profile pi-dev
```

## Quản lý profile

Liệt kê toàn bộ profile theo kiểu dynamic:

```bash
pi-profile list
```

Tạo profile mới. Mặc định profile mới sẽ kế thừa `pi`:

```bash
pi-profile add pi-lab
```

Lệnh trên tạo:

```text
profiles/pi-lab/profile.json
```

với quan hệ kế thừa tới `pi`.

Tạo profile kế thừa từ một profile khác:

```bash
pi-profile add pi-review --extends pi-dev
```

Chạy profile mới giống như profile built-in:

```bash
pi-profile pi-review
```

Xóa custom profile:

```bash
pi-profile remove pi-review
```

Cơ chế an toàn:

- `pi` và `pi-dev` là protected profile, CLI không cho xóa;
- không cho xóa một profile nếu có profile khác đang kế thừa nó;
- nếu tên profile đã tồn tại thì `add` sẽ fail thay vì overwrite;
- tên profile phải match `^[a-z0-9][a-z0-9._-]*$`.

Vì profile definitions nằm trong Git repo này nên việc add/remove profile sẽ thay đổi working tree. Nếu muốn profile mới xuất hiện trên các máy khác thì commit và push các thay đổi đó.

## Chính sách extension

Bộ package được bật mặc định cố ý giữ nhỏ và pin version:

```text
pi
└── statusline-pi@1.3.1

pi-dev
├── inherits pi
├── advisor-pi@1.1.0
├── opencode-pi@1.3.0
└── optional pinned source extensions
```

Tài liệu chi tiết từng extension nằm tại [`docs/extensions/`](docs/extensions/README.md). Vòng đời của source extension được mô tả trong [`docs/source-extensions.md`](docs/source-extensions.md).

## Các command cho source extension

```bash
pi-profile sync
pi-profile sync --dry-run
pi-profile sync --all
```

Source extensions được khai báo trong `config/source-extensions.json` và pin tới đúng Git commit SHA. Source đã sync nằm dưới `.local/sources/`, thư mục này được Git ignore.

Điểm quan trọng là repo chỉ lưu declaration và commit pin, không commit toàn bộ clone của upstream source.

## Runtime của profile

Mỗi profile có Pi directory được generate riêng:

```text
pi-profile <name>
   ├─ PI_CODING_AGENT_DIR=~/.pi/profiles/<name>
   └─ PI_CODING_AGENT_SESSION_DIR=~/.pi/profiles/<name>/sessions
```

Launcher sẽ resolve bất kỳ profile nào có file:

```text
profiles/<name>/profile.json
```

Tên profile không còn bị hard-code trong launcher.

## Cài trên máy mới / VPS

```bash
git clone git@github.com:thieung/pi-setup.git
cd pi-setup
./scripts/bootstrap.sh
pi-profile sync
pi-profile pi
```

Provider credentials và trạng thái OAuth/API login cố ý không được copy bởi repo này. Hãy authenticate provider riêng trên từng máy.

Để update một máy đã cài sẵn:

```bash
cd ~/path/to/pi-setup
git pull --ff-only
./scripts/bootstrap.sh
pi-profile sync
```

## Secrets và machine-specific state

Không commit các dữ liệu sau:

- provider credentials;
- OAuth tokens;
- API keys;
- sessions;
- caches;
- generated package directories;
- absolute machine paths;
- extension config chứa token hoặc secret.

Repo này quản lý cấu hình và reproducible source pins, không quản lý secrets.

## Các command hiện có

```text
pi-profile <profile> [pi args...]
pi-profile list
pi-profile add <name> [--extends <profile>]
pi-profile remove <name>
pi-profile sync [--all] [--dry-run]
```

Ví dụ:

```bash
pi-profile pi
pi-profile pi-dev --model <model>
pi-profile add pi-lab
pi-profile add pi-review --extends pi-dev
pi-profile list
pi-profile remove pi-review
pi-profile sync --dry-run
```

## Workflow đề xuất

### Stable daily profile

Dùng:

```bash
pi-profile pi
```

Chỉ nên chứa các extension đã test kỹ và muốn dùng trên tất cả máy.

### Development profile

Dùng:

```bash
pi-profile pi-dev
```

Dành cho provider bridge, experimental extension và source-based extension.

### Custom profile

Ví dụ muốn tạo profile cho review code:

```bash
pi-profile add pi-review --extends pi
```

Sau đó chỉnh `profiles/pi-review/profile.json` để thêm package riêng.

Nếu muốn sync profile này sang máy khác:

```bash
git add profiles/pi-review
git commit -m "feat: add pi-review profile"
git push
```

Máy còn lại chỉ cần:

```bash
git pull --ff-only
./scripts/bootstrap.sh
```

## Roadmap

Các command hữu ích tiếp theo:

1. `pi-profile doctor` — kiểm tra Pi, Node, Git, manifests, source pins, optional CLIs và generated profiles.
2. `pi-profile diff` — hiển thị effective differences giữa bất kỳ hai profile nào.
3. CI validation cho profile rendering và source manifest schema.
4. Optional source-extension promotion helper.
5. Cải thiện bootstrap cho macOS/Linux/VPS.

## Nguyên tắc thiết kế

1. **Git là source of truth.**
2. **Stable nên boring.** Daily Pi chỉ chứa extension đã chứng minh ổn định.
3. **Experiment là overlay.** Profile kế thừa config thay vì duplicate.
4. **Profile là data, không phải hard-coded command.** Bất kỳ `profiles/<name>/profile.json` nào cũng có thể chạy.
5. **npm version phải được pin.**
6. **Source revision phải được pin theo commit SHA.**
7. **Secrets không thuộc về setup repo.**
8. **Không vô tình stack nhiều orchestration layer.**
9. **Generated runtime và synced source state phải có thể xóa và build lại từ repo.**

## Tài liệu extension

- [`statusline-pi`](docs/extensions/statusline-pi.md)
- [`advisor-pi`](docs/extensions/advisor-pi.md)
- [`opencode-pi`](docs/extensions/opencode-pi.md)
- [`subagents-pi`](docs/extensions/subagents-pi.md)
- [`pi-delegator`](docs/extensions/pi-delegator.md)
- [Extension index](docs/extensions/README.md)
- [Source extension workflow](docs/source-extensions.md)

## Nguồn tham khảo

- Pi Coding Agent: https://github.com/earendil-works/pi-coding-agent
- zuey-pi-setup: https://github.com/mrgoonie/zuey-pi-setup
- pi-profile-manager: https://github.com/thieung/pi-profile-manager
- luongnv89/pi-extensions: https://github.com/luongnv89/pi-extensions
- pinned upstream source commit: https://github.com/luongnv89/pi-extensions/commit/ca99973d1e9d3e030657adac9519fe2a80bf0699
