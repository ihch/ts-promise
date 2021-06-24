let i = 0;
const generateID = (): string => {
  return Date().toString() + i++;
}

type Executor<T> = (
  resolve: (result: T) => void,
  reject: (error: unknown) => void
) => void;

export class MyPromise<T> {
  private id: string;
  private state: "pending" | "fulfilled" | "rejected" = "pending";
  private value!: T;
  private error!: unknown;
  private onResolved?: (res: T) => void;
  private onRejected?: (err: unknown) => void;

  constructor(i: number, f: Executor<T>) {
    this.id = i.toString();
    f(
      (result) => {
        this.value = result;
        this.state = "fulfilled";
        this.callback();
        return this;
      },
      (error) => {
        this.error = error;
        this.state = "rejected";
        this.callback();
        return this;
      }
    );
  }

  callback() {
    if (this.state === 'fulfilled' && this.onResolved) {
      this.onResolved(this.value);
    }
    if (this.state === 'rejected' && this.onRejected) {
      this.onRejected(this.error);
    }
  }

  then<U>(i: number, g: (result: T) => MyPromise<U> | U): MyPromise<U> {
    const t = this;
    return new MyPromise(i, function (resolve, reject) {
      t.onResolved = (res) => {
        console.log(t.id, i);
        try {
          const r = g(res);
          if (r instanceof MyPromise) {
            resolve(r.value);
            return r;
          } else {
            resolve(r);
          }
        } catch (e) {
          reject(e);
        }
      };
    });
  }

  catch<U>(i: number, g: (error: unknown) => MyPromise<U> | U): MyPromise<U> {
    const t = this;
    return new MyPromise(i, function (resolve, reject) {
      t.onRejected = (res) => {
        console.log(t.id, i);
        try {
          const e = g(res);
          if (e instanceof MyPromise) {
            resolve(e.value);
            return e;
          } else {
            resolve(e);
          }
        } catch (e) {
          reject(e);
        }
      };
    });
  }
}

function main() {
  new MyPromise(0, (resolve) => {
    setTimeout(() => {
      console.log("hello");
      resolve(1);
    }, 3000);
  })
    .then(1, (v) => {
      console.log("hello world then1:", v);
      return 2;
    })
    .then(2, (v) =>
      {
        setTimeout(() => {
          console.log("then2:", v);
        }, 1000);
        return 3;
      }
    )
    .then(3, (v) => console.log('asdf', v))
    .then(4, () => {
      throw new Error("kowareta-");
    })
    .catch(5, (e) => console.log(e));
}

main();
