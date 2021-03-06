// Primitives used to construct an expected repository state.

import {
  ActionSequence,
  IFileCreateOptions,
  IFileGenerator,
  FileCreateAction,
  IFileModifyOptions,
  IFileModifier,
  FileModifyAction,
  CommitAction,
  ICommitOptions,
  BranchAction,
  CheckoutAction,
  MergeAction,
  IPushOptions,
  PushAction,
} from "./action";

export class Repository {
  private actionSequence: ActionSequence;
  private currentBranch: string;
  constructor() {
    this.actionSequence = new ActionSequence();
    this.currentBranch = "master";
  }

  finalize(): ActionSequence {
    return this.actionSequence;
  }

  times(count: number, block: (i: number) => {}): this {
    for (let i = 0; i < count; i++) {
      block(i);
    }
    return this;
  }

  createFile(
    relativePath: string,
    options: IFileCreateOptions = {},
    callback: IFileGenerator = () => {}
  ): this {
    this.actionSequence.add(
      new FileCreateAction({relativePath, ...options}, callback)
    );
    return this;
  }

  changeFile(
    relativePath: string,
    options: Omit<IFileModifyOptions, "relativePath">,
    callback: IFileModifier = () => {}
  ): this {
    this.actionSequence.add(
      new FileModifyAction({relativePath, ...options}, callback)
    );
    return this;
  }

  branch(name: string, during: () => any = () => {}): this {
    const previousBranch = this.currentBranch;
    this.actionSequence.add(new BranchAction(name));
    this.currentBranch = name;

    during();

    this.actionSequence.add(new CheckoutAction(previousBranch));
    this.currentBranch = previousBranch;
    return this;
  }

  commit(options: ICommitOptions = {}): this {
    this.actionSequence.add(new CommitAction(options));
    return this;
  }

  merge(name: string): this {
    this.actionSequence.add(new MergeAction(name));
    return this;
  }

  push(options: IPushOptions = {}): this {
    this.actionSequence.add(new PushAction(options));
    return this;
  }
}
